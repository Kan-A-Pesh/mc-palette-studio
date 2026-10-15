"use client";

import { RiDoorLine, RiInformationLine } from "@repo/ui/icon";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmationDialog } from "@repo/ui/custom/confirmation-dialog";
import * as Button from "@repo/ui/button";
import { FormGlobalMessage } from "@repo/ui/form";
import { toast } from "@repo/ui/toast";
import { useOrganizationLeave } from "@/hooks/organization/use-organization-leave";
import { orpc } from "@/orpc/client";

import setNextOrg from "./set-next-org";

export default function LeaveOrganization() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const leaveOrganizationMutation = useOrganizationLeave();

  const { data: organization } = useSuspenseQuery(
    orpc.organization.getActiveOrganization.queryOptions(),
  );
  const { data: currentUser } = useSuspenseQuery(
    orpc.organization.getActiveMember.queryOptions(),
  );

  const isOwner = currentUser?.role === "owner";

  const handleLeave = async () => {
    try {
      await leaveOrganizationMutation.mutateAsync({
        organizationId: organization.id,
      });

      await setNextOrg();
      router.refresh();
      setIsOpen(false);

      queryClient.invalidateQueries({
        queryKey: [["organization"]],
      });
    } catch {
      toast.error("Failed to leave organization");
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="text-label-sm text-text-strong-950">
          Leave Organization
        </div>
        <p className="mt-1 text-paragraph-xs text-text-sub-600">
          Permanently leave this organization. You will no longer have access to
          any resources in this organization.
        </p>
      </div>

      {isOwner && (
        <FormGlobalMessage className="mt-2 text-paragraph-xs" variant="warning">
          As the owner, you cannot leave the organization. You must either
          transfer ownership or delete the organization.
        </FormGlobalMessage>
      )}

      <Button.Root
        disabled={!currentUser || isOwner}
        mode="stroke"
        onClick={() => setIsOpen(true)}
        variant="error"
      >
        <Button.Icon as={RiDoorLine} />
        Leave Organization
      </Button.Root>

      <ConfirmationDialog
        cancelText="Cancel"
        confirmText="Leave Organization"
        description={`Are you sure you want to leave ${organization?.name}? Once you leave ${organization?.name}, you will lose access to all resources and data within this organization. This action cannot be undone.`}
        icon={RiInformationLine}
        isLoading={leaveOrganizationMutation.isPending}
        onConfirm={handleLeave}
        onOpenChange={setIsOpen}
        open={isOpen}
        title="Leave Organization"
        variant="danger"
      />
    </div>
  );
}
