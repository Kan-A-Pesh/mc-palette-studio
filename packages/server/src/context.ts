import { os } from "@orpc/server";
import z from "zod";
import type { UserRole } from "@repo/database";
import type { Database } from "@repo/database";
import type { AuthSession } from "@repo/database/auth";
import type { statements } from "@repo/database/organization";

type OrganizationResource = keyof typeof statements;
type OrganizationAction<R extends OrganizationResource> =
  (typeof statements)[R][number];

export interface OrganizationPermission<
  R extends OrganizationResource = OrganizationResource,
> {
  resource: R;
  actions: OrganizationAction<R>[];
}

export interface Meta {
  roles?: UserRole[];
  permission?: OrganizationPermission;
}

export const base = os
  .$context<{
    headers: Headers;
    db: Database;
    session?: AuthSession | null;
    userRole?: UserRole;
  }>()
  .errors({
    RATE_LIMIT_EXCEEDED: {
      status: 429,
      data: z.object({
        retryAfterSeconds: z
          .number()
          .describe("The number of seconds to wait before retrying."),
        totalRequests: z
          .number()
          .describe("The total number of requests made."),
        remainingRequests: z
          .number()
          .describe("The number of requests remaining."),
      }),
    },
    UNAUTHORIZED: {
      status: 401,
    },
    FORBIDDEN: {
      status: 403,
    },
    ADMIN_PROCEDURE_MISSING_ROLES: {
      status: 500,
      message: "Admin procedure used without specifying required roles in meta",
    },
    NO_ACTIVE_ORGANIZATION: {
      status: 400,
      message: "User has no active organization",
    },
  })
  .$meta<Meta>({ roles: undefined, permission: undefined });
