"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import * as Divider from "@repo/ui/divider";
import { orpc } from "@/orpc/client";

import DeleteOrganization from "./sections/delete-organization";
import LeaveOrganization from "./sections/leave-organization";

export default function Danger() {
  const { data: activeMember } = useSuspenseQuery(
    orpc.organization.getActiveMember.queryOptions(),
  );

  const isOwner = activeMember?.role === "owner";

  return (
    <div className="flex w-full flex-col gap-4">
      <div>
        <div className="text-label-md">Danger Zone</div>
        <p className="mt-1 text-paragraph-sm text-text-sub-600">
          These actions are destructive and cannot be reversed
        </p>
      </div>

      <Divider.Root variant="line-spacing" />

      <LeaveOrganization />

      {isOwner && (
        <>
          <Divider.Root variant="dotted-line" />

          <DeleteOrganization />
        </>
      )}
    </div>
  );
}
