"use client";

import { RiCheckLine, RiCloseLine } from "@repo/ui/icon";
import { useRouter } from "next/navigation";

import * as Avatar from "@repo/ui/avatar";
import * as CompactButton from "@repo/ui/compact-button";
import { PAGES } from "@/constants/pages";
import { authClient } from "@/lib/auth/auth-client";
import type { RouterOutput } from "@/orpc/client";

type Invitation = RouterOutput["organization"]["listUserInvitations"][number];

export function InvitationCard({ invitation }: { invitation: Invitation }) {
  const router = useRouter();

  const handleAccept = async () => {
    try {
      await authClient.organization.acceptInvitation({
        invitationId: invitation.id,
      });
      await authClient.organization.setActive({
        organizationId: invitation.organizationId,
      });

      router.refresh();
    } catch (error) {
      console.error("Failed to accept invitation:", error);
      // Re-sync the UI so the invitation row reflects the real server state
      // instead of a stale optimistic transition.
      router.refresh();
    }
  };

  const handleDecline = async () => {
    try {
      await authClient.organization.rejectInvitation({
        invitationId: invitation.id,
      });
      router.push(PAGES.APPLICATION.DASHBOARD);
    } catch (error) {
      console.error("Failed to decline invitation:", error);
      // Re-sync the UI so the invitation row reflects the real server state
      // instead of a stale optimistic transition.
      router.refresh();
    }
  };

  const organizationName = invitation.organization.name;
  const inviterName = invitation.user.email;
  const organizationImage = invitation.organization.logo;

  return (
    <div className="overflow-hidden rounded-lg border border-stroke-soft-200">
      <div className="p-4">
        <div className="flex items-center gap-4">
          <Avatar.Root className="h-12 w-12">
            {organizationImage && (
              <Avatar.Image alt={organizationName} src={organizationImage} />
            )}
          </Avatar.Root>

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium text-paragraph-md text-text-strong-950">
              {organizationName}
            </h3>
            <p className="truncate text-paragraph-sm text-text-sub-600">
              Invited by {inviterName}
            </p>
          </div>

          <div className="flex gap-2">
            <CompactButton.Root
              className="text-success-base hover:text-success-dark"
              onClick={handleAccept}
              size="large"
              variant="ghost"
            >
              <CompactButton.Icon as={RiCheckLine} />
            </CompactButton.Root>

            <CompactButton.Root
              onClick={handleDecline}
              size="large"
              variant="ghost"
            >
              <CompactButton.Icon as={RiCloseLine} />
            </CompactButton.Root>
          </div>
        </div>
      </div>
    </div>
  );
}
