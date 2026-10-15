import { and, count, desc, eq, getTableColumns } from "drizzle-orm";
import { member, organization } from "@repo/database";
import { authenticatedProcedure } from "../../../procedure/authenticated.procedure";

export const getUserOrganizationsBase = authenticatedProcedure;

export const getUserOrganizationsHandler = getUserOrganizationsBase.handler(
  async ({ context }) => {
    const { db, session } = context;

    const memberCountSubquery = db.$with("member_counts").as(
      db
        .select({
          organizationId: member.organizationId,
          memberCount: count().as("memberCount"),
        })
        .from(member)
        .groupBy(member.organizationId),
    );

    const result = await db
      .with(memberCountSubquery)
      .select({
        ...getTableColumns(organization),
        role: member.role,
        membersCount: memberCountSubquery.memberCount,
      })
      .from(organization)
      .innerJoin(
        member,
        and(
          eq(organization.id, member.organizationId),
          eq(member.userId, session.user.id),
        ),
      )
      .leftJoin(
        memberCountSubquery,
        eq(organization.id, memberCountSubquery.organizationId),
      )
      .orderBy(desc(member.createdAt));

    const organizations = result.map((org) => ({
      id: org.id,
      name: org.name,
      slug: org.slug || "",
      logo: org.logo,
      createdAt: org.createdAt,
      metadata: org.metadata,
      role: org.role,
      membersCount: org.membersCount ?? 0,
    }));

    const activeOrganizationId = session.session.activeOrganizationId;

    const activeOrganization = organizations.find(
      (org) => org.id === activeOrganizationId,
    );

    return {
      activeOrganization,
      organizations,
    };
  },
);
