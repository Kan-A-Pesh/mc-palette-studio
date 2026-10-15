import { and, eq, gte } from "drizzle-orm";

import { invitation } from "@repo/database";
import { authenticatedProcedure } from "../../../procedure/authenticated.procedure";

export const listUserInvitationsBase = authenticatedProcedure;

export const listUserInvitationsHandler = listUserInvitationsBase.handler(
  async ({ context }) => {
    const { db, session } = context;

    const invitations = await db.query.invitation.findMany({
      where: and(
        eq(invitation.email, session.user.email),
        eq(invitation.status, "pending"),
        gte(invitation.expiresAt, new Date()),
      ),
      with: {
        organization: {
          columns: {
            logo: true,
            name: true,
          },
        },
        user: {
          columns: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: (invitation, { desc }) => desc(invitation.expiresAt),
    });

    return invitations;
  },
);
