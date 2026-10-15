import { and, eq, type SQL } from "drizzle-orm";
import { member } from "@repo/database";

interface BuildMemberFilterParams {
  organizationId: string;
  tab: string;
}

export function buildMemberFilter({
  organizationId,
  tab,
}: BuildMemberFilterParams): SQL | undefined {
  if (tab !== "all" && tab !== "members") {
    return and(eq(member.organizationId, organizationId), eq(member.role, tab));
  }

  return eq(member.organizationId, organizationId);
}
