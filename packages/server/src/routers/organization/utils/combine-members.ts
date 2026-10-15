export interface CombinedMember {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  type: "member" | "invitation";
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

interface CombineMembersParams {
  formattedMembers: CombinedMember[];
  formattedInvitations: CombinedMember[];
  tab: string;
}

export function combineAndSortMembers({
  formattedMembers,
  formattedInvitations,
  tab,
}: CombineMembersParams): CombinedMember[] {
  let combinedMembers: CombinedMember[] = [];

  if (tab === "members") {
    combinedMembers = formattedMembers;
  } else if (tab === "invited") {
    combinedMembers = formattedInvitations;
  } else {
    combinedMembers = [...formattedMembers, ...formattedInvitations];
  }

  // Sort by createdAt in descending order
  combinedMembers.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return combinedMembers;
}
