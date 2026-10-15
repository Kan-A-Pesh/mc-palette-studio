"use client";

import {
  RiMore2Line,
  RiUserFill,
  RiUserForbidFill,
  RiUserForbidLine,
  RiUserSettingsLine,
  RiUserStarFill,
  RiUserStarLine,
  RiUserUnfollowFill,
  RiUserUnfollowLine,
} from "@repo/ui/icon";
import { useState } from "react";

import { ConfirmationDialog } from "@repo/ui/custom/confirmation-dialog";
import * as Button from "@repo/ui/button";
import * as Dropdown from "@repo/ui/dropdown";
import { USER_ROLES } from "@repo/database/constants";
import type { RouterOutput } from "@/orpc/client";

import { useUserTableActions } from "../_hooks/use-user-table-actions";

type User = RouterOutput["auth"]["listUsers"]["data"][number];

export interface UserActionsProps {
  user: User;
}

export function UserActions({ user }: UserActionsProps) {
  const {
    handleImpersonate,
    handleBanUser,
    handleUnbanUser,
    handleChangeRole,
  } = useUserTableActions(user);

  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showUnbanDialog, setShowUnbanDialog] = useState(false);

  const onConfirmBan = () => {
    handleBanUser();
    setShowBanDialog(false);
  };

  const onConfirmUnban = () => {
    handleUnbanUser();
    setShowUnbanDialog(false);
  };

  return (
    <>
      <Dropdown.Root>
        <Dropdown.Trigger asChild>
          <Button.Root
            className="ml-auto"
            mode="ghost"
            size="xsmall"
            variant="neutral"
          >
            <Button.Icon as={RiMore2Line} />
          </Button.Root>
        </Dropdown.Trigger>
        <Dropdown.Content align="end" className="w-48">
          {!user.banned && (
            <Dropdown.Item onClick={handleImpersonate}>
              <Dropdown.ItemIcon as={RiUserStarLine} />
              Impersonate User
            </Dropdown.Item>
          )}

          {/* Role Change Submenu */}
          {!user.banned && (
            <Dropdown.MenuSub>
              <Dropdown.MenuSubTrigger>
                <Dropdown.ItemIcon as={RiUserSettingsLine} />
                Change Role
              </Dropdown.MenuSubTrigger>
              <Dropdown.MenuSubContent>
                <Dropdown.Item
                  disabled={user.role === USER_ROLES.ADMIN}
                  onClick={() => handleChangeRole(USER_ROLES.ADMIN)}
                >
                  <Dropdown.ItemIcon as={RiUserStarFill} />
                  Admin
                </Dropdown.Item>
                <Dropdown.Item
                  disabled={user.role === USER_ROLES.USER}
                  onClick={() => handleChangeRole(USER_ROLES.USER)}
                >
                  <Dropdown.ItemIcon as={RiUserFill} />
                  User
                </Dropdown.Item>
              </Dropdown.MenuSubContent>
            </Dropdown.MenuSub>
          )}

          {/* Ban/Unban actions */}
          <Dropdown.Item
            className="text-error-500"
            onClick={() =>
              user.banned ? setShowUnbanDialog(true) : setShowBanDialog(true)
            }
          >
            {user.banned ? (
              <Dropdown.ItemIcon as={RiUserUnfollowLine} />
            ) : (
              <Dropdown.ItemIcon as={RiUserForbidLine} />
            )}
            {user.banned ? "Unban User" : "Ban User"}
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Root>

      {/* Ban Confirmation Dialog */}
      <ConfirmationDialog
        cancelText="Cancel"
        confirmText="Ban User"
        description={`Are you sure you want to ban ${user.email}? This will prevent the user from logging in.`}
        icon={RiUserForbidFill}
        onConfirm={onConfirmBan}
        onOpenChange={setShowBanDialog}
        open={showBanDialog}
        title="Ban User"
        variant="danger"
      />

      {/* Unban Confirmation Dialog */}
      <ConfirmationDialog
        cancelText="Cancel"
        confirmText="Unban User"
        description={`Are you sure you want to unban ${user.email}? This will allow the user to log in again.`}
        icon={RiUserUnfollowFill}
        onConfirm={onConfirmUnban}
        onOpenChange={setShowUnbanDialog}
        open={showUnbanDialog}
        title="Unban User"
        variant="warning"
      />
    </>
  );
}
