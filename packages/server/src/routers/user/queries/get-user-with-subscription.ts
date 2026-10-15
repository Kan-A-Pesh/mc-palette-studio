import { and, eq, or } from "drizzle-orm";
import { subscription, user } from "@repo/database";
import { authenticatedProcedure } from "../../../procedure/authenticated.procedure";

export const getUserWithSubscriptionBase = authenticatedProcedure.errors({
  USER_NOT_FOUND: {
    status: 404,
  },
});

export const getUserWithSubscriptionHandler =
  getUserWithSubscriptionBase.handler(async ({ context, errors }) => {
    const { db, session } = context;

    const [result] = await db
      .select({
        user,
        subscription,
      })
      .from(user)
      .leftJoin(
        subscription,
        and(
          eq(user.id, subscription.referenceId),
          or(
            eq(subscription.status, "active"),
            eq(subscription.status, "trialing"),
          ),
        ),
      )
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!result) {
      throw errors.USER_NOT_FOUND();
    }

    return {
      ...result.user,
      subscription: result.subscription,
    };
  });
