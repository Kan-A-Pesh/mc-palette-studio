import type { UserRole } from "@repo/database";
import { base } from "../context";

export const adminMiddleware = base.middleware(async (opts) => {
  const { next, procedure, errors, context } = opts;

  const requiredRoles = procedure["~orpc"].meta.roles;

  if (!requiredRoles || requiredRoles.length === 0) {
    throw errors.ADMIN_PROCEDURE_MISSING_ROLES();
  }

  const userRole = context.session?.user.role as UserRole | undefined;

  if (!userRole) {
    throw errors.UNAUTHORIZED();
  }

  if (!requiredRoles.includes(userRole)) {
    throw errors.FORBIDDEN();
  }

  return next({
    context: {
      ...context,
      session: context.session!,
      userRole,
    },
  });
});
