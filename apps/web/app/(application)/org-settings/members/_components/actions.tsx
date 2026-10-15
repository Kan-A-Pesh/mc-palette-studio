"use client";

import {
  RiMailSendLine,
  RiMore2Line,
  RiUserSettingsLine,
  RiUserUnfollowLine,
} from "@repo/ui/icon";

import type { CombinedMember } from "@repo/server";

import * as Button from "@repo/ui/button";
import * as Dropdown from "@repo/ui/dropdown";

import { useMemberActions } from "../_hooks/use-member-actions";

interface ActionCellProps {
  member: CombinedMember;
  activeMember: {
    id: string;
    role: string;
  };
}

export function ActionCell({ member, activeMember }: ActionCellProps) {
  const {
    isInvited,
    handleCancelInvitation,
    handleResendInvitation,
    handleUpdateRole,
    handleRemoveMember,
  } = useMemberActions(member);

  if (activeMember.role === "member") {
    return null;
  }

  if (member.userId === activeMember.id && activeMember.role === "owner") {
    return null;
  }

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <Button.Root mode="ghost" size="xsmall" variant="neutral">
          <Button.Icon as={RiMore2Line} />
        </Button.Root>
      </Dropdown.Trigger>
      <Dropdown.Content align="end" className="w-56">
        <Dropdown.Group>
          {isInvited ? (
            <>
              <Dropdown.Item onClick={handleResendInvitation}>
                <Dropdown.ItemIcon as={RiMailSendLine} />
                Resend Invitation
              </Dropdown.Item>
              <Dropdown.Item
                className="text-error-base data-[highlighted]:bg-error-lighter data-[highlighted]:text-error-dark"
                onClick={handleCancelInvitation}
              >
                <Dropdown.ItemIcon
                  as={RiUserUnfollowLine}
                  className="text-error-base"
                />
                Cancel Invitation
              </Dropdown.Item>
            </>
          ) : (
            <>
              <Dropdown.MenuSub>
                <Dropdown.MenuSubTrigger>
                  <Dropdown.ItemIcon as={RiUserSettingsLine} />
                  Change Role
                </Dropdown.MenuSubTrigger>
                <Dropdown.MenuSubContent className="w-48">
                  <Dropdown.Item
                    disabled={member.role === "owner"}
                    onClick={() => handleUpdateRole("owner")}
                  >
                    Owner
                  </Dropdown.Item>
                  <Dropdown.Item
                    disabled={member.role === "admin"}
                    onClick={() => handleUpdateRole("admin")}
                  >
                    Admin
                  </Dropdown.Item>
                  <Dropdown.Item
                    disabled={member.role === "member"}
                    onClick={() => handleUpdateRole("member")}
                  >
                    Member
                  </Dropdown.Item>
                </Dropdown.MenuSubContent>
              </Dropdown.MenuSub>
              <Dropdown.Item
                className="text-error-base data-[highlighted]:bg-error-lighter data-[highlighted]:text-error-base"
                onClick={handleRemoveMember}
              >
                <Dropdown.ItemIcon
                  as={RiUserUnfollowLine}
                  className="text-error-base"
                />
                Remove Member
              </Dropdown.Item>
            </>
          )}
        </Dropdown.Group>
      </Dropdown.Content>
    </Dropdown.Root>
  );
}
