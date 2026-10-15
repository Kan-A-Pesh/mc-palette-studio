import { and, eq, ilike, type SQL } from "drizzle-orm";
import { invitation } from "@repo/database";

interface BuildInvitationFilterParams {
  organizationId: string;
  tab: string;
  search?: string;
}

export function buildInvitationFilter({
  organizationId,
  tab,
  search,
}: BuildInvitationFilterParams): SQL | undefined {
  const baseConditions = [
    eq(invitation.organizationId, organizationId),
    eq(invitation.status, "pending"),
  ];

  if (tab !== "all" && tab !== "invited") {
    baseConditions.push(eq(invitation.role, tab));
  }

  if (search) {
    baseConditions.push(ilike(invitation.email, `%${search}%`));
  }

  return and(...baseConditions);
}
