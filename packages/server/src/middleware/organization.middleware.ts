import { auth } from "@repo/database/auth";
import { base } from "../context";

export const organizationMiddleware = base.middleware(async (opts) => {
  const { next, procedure, errors, context } = opts;

  const activeOrganizationId = context.session!.session.activeOrganizationId;

  if (!activeOrganizationId) {
    throw errors.NO_ACTIVE_ORGANIZATION();
  }

  const permission = procedure["~orpc"].meta.permission;

  if (permission) {
    const permissionToCheck = {
      [permission.resource]: permission.actions,
    };

    const hasPermissionResult = await auth.api.hasPermission({
      headers: context.headers,
      body: {
        permissions: permissionToCheck,
      },
    });

    if (!hasPermissionResult.success) {
      throw errors.FORBIDDEN();
    }
  }

  const activeOrganization = await auth.api.getFullOrganization({
    headers: context.headers,
    query: {
      organizationId: activeOrganizationId,
    },
  });

  if (!activeOrganization) {
    throw errors.NO_ACTIVE_ORGANIZATION();
  }

  return next({
    context: {
      ...context,
      session: context.session!,
      activeOrganization,
    },
  });
});
