import { eq } from "drizzle-orm";
import { db } from "../database";
import { member } from "../schema";

export async function getUserOrganizations(userId: string) {
  const userOrganizations = await db.query.member.findMany({
    where: eq(member.userId, userId),
    with: {
      organization: true,
    },
    orderBy: (memberRecord, { desc }) => desc(memberRecord.createdAt),
  });

  return userOrganizations.map((memberRecord) => ({
    ...memberRecord.organization,
    role: memberRecord.role,
  }));
}
