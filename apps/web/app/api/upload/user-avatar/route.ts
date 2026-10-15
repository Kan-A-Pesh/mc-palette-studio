import { del } from "@vercel/blob";
import { type HandleUploadBody, handleUpload } from "@vercel/blob/client";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, user } from "@repo/database";
import { createOnBeforeGenerateToken } from "@/lib/upload/on-before-generate-token";

/**
 * API route for handling client-side uploads to Vercel Blob
 * This is required for the client-side Vercel Blob SDK to work
 *
 * @see https://vercel.com/docs/vercel-blob/client-upload
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: createOnBeforeGenerateToken((session) => ({
        userId: session.user.id,
      })),
      onUploadCompleted: async ({ tokenPayload }) => {
        try {
          if (!tokenPayload) {
            throw new Error("No token payload");
          }

          const { userId } = z
            .object({
              userId: z.string(),
            })
            .parse(JSON.parse(tokenPayload));

          const currentUser = await db.query.user.findFirst({
            where: eq(user.id, userId),
          });

          if (currentUser?.image) {
            del(currentUser.image);
          }
        } catch {
          throw new Error("Failed to update avatar in database");
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
