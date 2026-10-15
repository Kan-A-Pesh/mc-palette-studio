import { eq } from "drizzle-orm";

import { user } from "@repo/database";
import { authenticatedProcedure } from "../../../procedure/authenticated.procedure";

export const getUserProfileBase = authenticatedProcedure.errors({
  USER_NOT_FOUND: {
    status: 404,
  },
});

export const getUserProfileHandler = getUserProfileBase.handler(
  async ({ context, errors }) => {
    const { db, session } = context;
    const userId = session.user.id;

    const [userData] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        emailVerified: user.emailVerified,
        role: user.role,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!userData) {
      throw errors.USER_NOT_FOUND();
    }

    return userData;
  },
);
