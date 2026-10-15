import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { invitation, member, user } from "@repo/database";
import { buildInvitationFilter } from "../utils/build-invitation-filter";
import { buildMemberFilter } from "../utils/build-member-filter";
import { combineAndSortMembers } from "../utils/combine-members";
import { formatInvitations, formatMembers } from "../utils/format-members";
import { listMembersSchema } from "../validators";
import { organizationProcedure } from "../../../procedure/organization.procedure";

export const listMembersBase = organizationProcedure.input(listMembersSchema);

export const listMembersHandler = listMembersBase.handler(
  async ({ input, context }) => {
    const { db, activeOrganization } = context;
    const { tab, search, page, limit } = input;

    const memberFilter = buildMemberFilter({
      organizationId: activeOrganization.id,
      tab,
    });

    const searchFilter = search
      ? or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`))
      : undefined;

    const whereCondition = searchFilter
      ? and(memberFilter, searchFilter)
      : memberFilter;

    const members = await db
      .select()
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(whereCondition)
      .orderBy(
        tab === "owner" ? asc(member.createdAt) : desc(member.createdAt),
      );

    const invitations =
      tab === "members"
        ? []
        : await db
            .select()
            .from(invitation)
            .innerJoin(user, eq(invitation.inviterId, user.id))
            .where(
              buildInvitationFilter({
                organizationId: activeOrganization.id,
                tab,
                search,
              }),
            )
            .orderBy(desc(invitation.expiresAt));

    const formattedMembers = formatMembers(members);
    const formattedInvitations = formatInvitations(invitations);

    const combinedMembers = combineAndSortMembers({
      formattedMembers,
      formattedInvitations,
      tab,
    });

    const total = combinedMembers.length;
    const offset = (page - 1) * limit;
    const paginatedMembers = combinedMembers.slice(offset, offset + limit);
    const totalPages = Math.ceil(total / limit);

    return {
      members: paginatedMembers,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  },
);
