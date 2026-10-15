import type { CombinedMember } from "@repo/server";

import { toast } from "@repo/ui/toast";
import { authClient } from "@/lib/auth/auth-client";
import { useInvalidateOrgMembers } from "./use-invalidate-org-members";

export function useMemberActions(member: CombinedMember) {
  const invalidateOrgMembers = useInvalidateOrgMembers();

  const isInvited = member.type === "invitation";

  const handleCancelInvitation = () => {
    toast.promise(
      authClient.organization.cancelInvitation(
        {
          invitationId: member.id,
        },
        {
          onSuccess: () => {
            invalidateOrgMembers();
          },
          onError: () => {
            const key = "orgSettings.members.toast.invitationCanceledError";
            throw Object.assign(new Error(key), { i18nKey: key });
          },
        },
      ),
      {
        loading: "Invitation Canceled",
        success: `The invitation to ${member.user.email} has been canceled`,
        error: "Failed to cancel invitation",
      },
    );
  };

  const handleRemoveMember = () => {
    toast.promise(
      authClient.organization.removeMember(
        { memberIdOrEmail: member.id },
        {
          onSuccess: () => {
            invalidateOrgMembers();
          },
          onError: () => {
            const key = "orgSettings.members.toast.removeMemberError";
            throw Object.assign(new Error(key), { i18nKey: key });
          },
        },
      ),
      {
        loading: "Removing member...",
        success: `${member.user.name || member.user.email} has been removed from the organization`,
        error: "Failed to remove member",
      },
    );
  };

  const handleResendInvitation = async () => {
    try {
      const org = await authClient.organization.getFullOrganization();

      if (!org.data) {
        const key = "orgSettings.members.errors.genericError";
        throw Object.assign(new Error(key), { i18nKey: key });
      }

      const cancelStatus = await Promise.all(
        org.data.invitations
          .filter((i) => i.email === member.user.email)
          .map((i) =>
            authClient.organization.cancelInvitation({
              invitationId: i.id,
            }),
          ),
      );

      if (cancelStatus.some((s) => s.error)) {
        const key = "orgSettings.members.toast.invitationCanceledError";
        throw Object.assign(new Error(key), { i18nKey: key });
      }

      toast.promise(
        authClient.organization.inviteMember(
          {
            email: member.user.email,
            organizationId: member.organizationId,
            role: member.role as "member" | "admin" | "owner",
            resend: true,
          },
          {
            onSuccess: () => {
              invalidateOrgMembers();
            },
            onError: () => {
              const key = "orgSettings.members.modal.addMember.error";
              throw Object.assign(new Error(key), {
                i18nKey: key,
              });
            },
          },
        ),
        {
          loading: "Invitation Resent",
          success: `The invitation has been resent to ${member.user.email}`,
          error: "Failed to remove member",
        },
      );
    } catch {
      toast.error("An error occurred", {
        description: "Failed to remove member",
      });
    }
  };

  const handleUpdateRole = (role: "owner" | "admin" | "member") => {
    if (member.role === "invited") {
      toast.error("An error occurred", {
        description: "Failed to update member role",
      });
      return;
    }

    toast.promise(
      authClient.organization.updateMemberRole(
        {
          memberId: member.id,
          role,
        },
        {
          onSuccess: () => {
            invalidateOrgMembers();
          },
          onError: () => {
            const key = "orgSettings.members.toast.updateMemberError";
            throw Object.assign(new Error(key), { i18nKey: key });
          },
        },
      ),
      {
        loading: "Success",
        success: `${member.user.name}'s role has been updated to ${role}`,
        error: "Failed to update member role",
      },
    );
  };

  return {
    isInvited,
    handleCancelInvitation,
    handleResendInvitation,
    handleUpdateRole,
    handleRemoveMember,
  };
}
