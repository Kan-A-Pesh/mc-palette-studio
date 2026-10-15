"use client";

import type { ColumnDef } from "@tanstack/react-table";

import * as Avatar from "@repo/ui/avatar";
import * as Badge from "@repo/ui/badge";
import * as Checkbox from "@repo/ui/checkbox";
import { IconVerifiedFill } from "@repo/ui/icons";
import { formatRelativeDate } from "@/lib/format-relative-date";
import { getSortingIcon } from "@repo/ui/table";
import type { RouterOutput } from "@/orpc/client";

import { UserActions } from "./actions";

export type User = RouterOutput["auth"]["listUsers"]["data"][number];

export function getUsersColumns(): ColumnDef<User, unknown>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox.Root
          aria-label="Select all"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox.Root
          aria-label="Select row"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "user",
      accessorKey: "name",
      header: ({ column }) => (
        <div className="flex items-center gap-0.5">
          User
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            type="button"
          >
            {getSortingIcon(column.getIsSorted())}
          </button>
        </div>
      ),
      enableSorting: true,
      cell: ({ row }) => {
        const user = row.original;
        if (!user) {
          return null;
        }

        return (
          <div className="flex items-center gap-3">
            <Avatar.Root size="32">
              {user.image ? (
                <Avatar.Image alt={user.name} src={user.image} />
              ) : undefined}
            </Avatar.Root>
            <div>
              <div className="font-medium text-text-strong-950">
                {user.name}
              </div>
              <div className="text-paragraph-xs text-text-soft-400">
                {user.email}
              </div>
            </div>
          </div>
        );
      },
      meta: {
        className: "w-full",
      },
    },
    {
      id: "role",
      accessorKey: "role",
      header: ({ column }) => (
        <div className="flex items-center gap-0.5">
          Role
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            type="button"
          >
            {getSortingIcon(column.getIsSorted())}
          </button>
        </div>
      ),
      cell: ({ row }) => {
        const user = row.original;
        if (!user) {
          return null;
        }

        const role = user.role;
        const color = role === "admin" ? "red" : "blue";

        return (
          <div className="flex items-center gap-3">
            <Badge.Root color={color} variant="lighter">
              {role ? role : "User"}
            </Badge.Root>
          </div>
        );
      },
    },
    {
      id: "emailVerified",
      accessorKey: "emailVerified",
      header: () => (
        <div className="flex items-center gap-0.5">Email Verified</div>
      ),
      cell: ({ row }) => {
        const user = row.original;
        if (!user) {
          return null;
        }

        const verified = user.emailVerified;
        return (
          <div className="flex items-center gap-3">
            <Badge.Root color="blue" size="medium" variant="light">
              <Badge.Icon as={IconVerifiedFill} />
              {verified ? "Yes" : "No"}
            </Badge.Root>
          </div>
        );
      },
      meta: {
        className: "w-full",
      },
    },
    {
      id: "banned",
      accessorKey: "banned",
      header: () => <div className="flex items-center gap-0.5">Ban Status</div>,
      cell: ({ row }) => {
        const user = row.original;
        if (!user) {
          return null;
        }

        return (
          <div className="flex items-center gap-3">
            <Badge.Root
              color={user.banned ? "red" : "green"}
              size="medium"
              variant="light"
            >
              {user.banned ? "Banned" : "Active"}
            </Badge.Root>
          </div>
        );
      },
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: ({ column }) => (
        <div className="flex items-center gap-0.5">
          Joined
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            type="button"
          >
            {getSortingIcon(column.getIsSorted())}
          </button>
        </div>
      ),
      cell: ({ row }) => {
        const user = row.original;
        if (!user) {
          return null;
        }

        return (
          <div className="whitespace-nowrap text-paragraph-sm text-text-sub-600">
            {formatRelativeDate(user.createdAt)}
          </div>
        );
      },
      meta: {
        className: "w-full",
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;
        if (!user) {
          return null;
        }

        return <UserActions user={user} />;
      },
      meta: {
        className: "w-10",
      },
    },
  ];
}
