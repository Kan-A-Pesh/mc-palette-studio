import { getServerSession } from "../utils/auth";
import { base } from "../context";

export const authenticatedMiddleware = base.middleware(async (opts) => {
  const { next, errors, context } = opts;

  const session = context.session ?? (await getServerSession());

  if (!session) {
    throw errors.UNAUTHORIZED();
  }

  return next({
    context: {
      ...context,
      session,
    },
  });
});
