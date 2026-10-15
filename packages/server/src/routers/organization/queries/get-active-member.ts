import { and, eq } from "drizzle-orm";

import { member } from "@repo/database";
import { organizationProcedure } from "../../../procedure/organization.procedure";

export const getActiveMemberBase = organizationProcedure;

export const getActiveMemberHandler = getActiveMemberBase.handler(
  async ({ context }) => {
    const { db, session, activeOrganization } = context;

    const activeMember = await db.query.member.findFirst({
      where: and(
        eq(member.organizationId, activeOrganization.id),
        eq(member.userId, session.user.id),
      ),
      with: {
        organization: true,
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return activeMember;
  },
);
