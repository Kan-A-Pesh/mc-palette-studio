// Using the extended type to match the columns.tsx expectations
interface MemberData {
  member: {
    id: string;
    userId: string;
    organizationId: string;
    role: string;
    createdAt: Date;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface InvitationData {
  invitation: {
    id: string;
    organizationId: string;
    role: string | null;
    email: string;
    expiresAt: Date;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export function formatMembers(members: MemberData[]) {
  return members.map((m) => ({
    id: m.member.id,
    userId: m.member.userId,
    organizationId: m.member.organizationId,
    role: m.member.role,
    type: "member" as const,
    createdAt: m.member.createdAt,
    user: {
      id: m.user.id,
      email: m.user.email,
      name: m.user.name || m.user.email,
      image: m.user.image,
    },
  }));
}

export function formatInvitations(invitations: InvitationData[]) {
  return invitations.map((i) => ({
    id: i.invitation.id,
    userId: "",
    organizationId: i.invitation.organizationId,
    role: i.invitation.role || "member",
    type: "invitation" as const,
    createdAt: i.invitation.expiresAt,
    user: {
      id: i.invitation.id,
      email: i.invitation.email,
      name: `Invited (${i.invitation.email})`,
      image: null,
    },
  }));
}
