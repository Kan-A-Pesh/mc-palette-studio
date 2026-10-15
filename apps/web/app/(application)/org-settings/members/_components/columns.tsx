import type { ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";
import type { CombinedMember } from "@repo/server";

import * as Avatar from "@repo/ui/avatar";
import * as StatusBadge from "@repo/ui/status-badge";
import { cn } from "@repo/ui/utils/cn";
import { formatRelativeDate } from "@/lib/format-relative-date";

import { ActionCell } from "./actions";

export function getColumns(activeMember: {
  id: string;
  role: string;
}): ColumnDef<CombinedMember, unknown>[] {
  return [
    {
      id: "member",
      accessorKey: "user.name",
      header: () => <div className="flex items-center gap-0.5">Member</div>,
      enableSorting: false,
      cell: ({ row }) => {
        const isInvited = row.original.type === "invitation";

        // Determine avatar content
        let avatarContent: ReactNode = null;
        if (!isInvited) {
          if (row.original.user.image) {
            avatarContent = <Avatar.Image src={row.original.user.image} />;
          } else {
            avatarContent = row.original.user.name[0];
          }
        }

        return (
          <div
            className={cn("flex items-center gap-3", isInvited && "opacity-60")}
          >
            <Avatar.Root size="32">{avatarContent}</Avatar.Root>
            <div
              className={cn(
                "text-label-sm text-text-strong-950",
                isInvited && "italic",
              )}
            >
              {isInvited ? "Invited User" : row.original.user.name}
            </div>
          </div>
        );
      },
    },
    {
      id: "email",
      accessorKey: "user.email",
      header: () => <div className="flex items-center gap-0.5">Email</div>,
      cell: ({ row }) => {
        const isInvited = row.original.type === "invitation";
        return (
          <div className={cn("text-paragraph-sm", isInvited && "opacity-60")}>
            {row.original.user.email}
          </div>
        );
      },
    },
    {
      id: "joinedAt",
      accessorKey: "createdAt",
      header: () => <div className="flex items-center gap-0.5">Joined</div>,
      cell: ({ row }) => {
        const isInvited = row.original.type === "invitation";
        return (
          <div className={cn("text-paragraph-sm", isInvited && "opacity-60")}>
            <span className="font-medium">
              {isInvited ? "Invited" : "Joined"}
            </span>
            <br />
            {formatRelativeDate(row.original.createdAt)}
          </div>
        );
      },
    },
    {
      id: "role",
      accessorKey: "role",
      header: () => <div className="flex items-center gap-0.5">Role</div>,
      cell: ({ row }) => {
        const isInvited = row.original.type === "invitation";
        const STATUS_PENDING = "pending" as const;
        const STATUS_COMPLETED = "completed" as const;
        const STATUS_DISABLED = "disabled" as const;

        let status:
          | typeof STATUS_PENDING
          | typeof STATUS_COMPLETED
          | typeof STATUS_DISABLED;

        switch (row.original.role) {
          case "owner":
          case "admin":
            status = STATUS_PENDING;
            break;
          case "invited":
            status = STATUS_DISABLED;
            break;
          default:
            status = STATUS_COMPLETED;
            break;
        }

        return (
          <StatusBadge.Root
            className={cn(isInvited && "border-dashed opacity-60")}
            status={status}
            variant="stroke"
          >
            <StatusBadge.Dot />
            {row.original.role.charAt(0).toUpperCase() +
              row.original.role.slice(1)}
          </StatusBadge.Root>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <ActionCell activeMember={activeMember} member={row.original} />
      ),
      meta: {
        className: "px-5 w-0",
      },
    },
  ];
}
