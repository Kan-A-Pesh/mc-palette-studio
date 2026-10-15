import { eq } from "drizzle-orm";

import { user } from "@repo/database";
import { authenticatedProcedure } from "../../../procedure/authenticated.procedure";

export const getMeBase = authenticatedProcedure;

export const getMeHandler = getMeBase.handler(async ({ context }) => {
  const { db, session } = context;

  const result = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  return result;
});
