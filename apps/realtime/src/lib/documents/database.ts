import * as Y from "yjs";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { documents } from "@repo/database";
import { eq } from "drizzle-orm";
import { env } from "@/lib/env";

const pool = new Pool({ connectionString: env.DATABASE_URL });
const db = drizzle({ client: pool });

export async function loadDocumentFromDb(
  documentId: string,
): Promise<Uint8Array | null> {
  const result = await db
    .select({ yjsState: documents.yjsState })
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  const row = result[0];
  if (!row || !row.yjsState) {
    return null;
  }

  return Buffer.from(row.yjsState, "base64");
}

export async function saveDocumentToDb(
  documentId: string,
  doc: Y.Doc,
): Promise<void> {
  const state = Y.encodeStateAsUpdate(doc);
  const stateBase64 = Buffer.from(state).toString("base64");

  const xmlFragment = doc.getXmlFragment("prosemirror");
  const content = xmlFragment.toString();

  await db
    .insert(documents)
    .values({
      id: documentId,
      content,
      yjsState: stateBase64,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: documents.id,
      set: {
        content,
        yjsState: stateBase64,
        updatedAt: new Date(),
      },
    });

  console.log(`[documents] Saved document ${documentId} to database`);
}
