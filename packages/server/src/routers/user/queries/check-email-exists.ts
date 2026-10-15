import { eq, sql } from "drizzle-orm";

import { user } from "@repo/database";
import { publicProcedure } from "../../../procedure/public.procedure";
import { checkEmailExistsSchema } from "../validators";

export const checkEmailExistsBase = publicProcedure.input(
  checkEmailExistsSchema,
);

export const checkEmailExistsHandler = checkEmailExistsBase.handler(
  async ({ input, context }) => {
    const { db } = context;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(user)
      .where(eq(user.email, input.email.toLowerCase()));

    return (countResult?.count ?? 0) > 0;
  },
);
