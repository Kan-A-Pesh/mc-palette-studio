import { eq } from "drizzle-orm";

import { invitation } from "@repo/database";
import { publicProcedure } from "../../../procedure/public.procedure";
import { getInvitationSchema } from "../validators";

export const getInvitationBase = publicProcedure.input(getInvitationSchema);

export const getInvitationHandler = getInvitationBase.handler(
  async ({ input, context }) => {
    const { db } = context;
    const { id } = input;

    const invite = await db.query.invitation.findFirst({
      where: eq(invitation.id, id),
      with: {
        organization: {
          columns: {
            name: true,
          },
        },
      },
    });

    if (!invite) {
      return null;
    }

    return {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      status: invite.status,
      expiresAt: invite.expiresAt,
      organizationId: invite.organizationId,
      organizationName: invite.organization?.name,
    };
  },
);
