"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiDeleteBinLine, RiErrorWarningLine } from "@repo/ui/icon";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { StaggeredFadeLoader } from "@repo/ui/custom/staggered-fade-loader";
import * as Button from "@repo/ui/button";
import { FormGlobalMessage } from "@repo/ui/form";
import * as Input from "@repo/ui/input";
import * as Modal from "@repo/ui/modal";
import { toast } from "@repo/ui/toast";
import { useOrganizationDelete } from "@/hooks/organization/use-organization-delete";
import { orpc } from "@/orpc/client";
import setNextOrg from "./set-next-org";

export default function DeleteOrganization() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const deleteOrganizationMutation = useOrganizationDelete();

  const { data: organization } = useSuspenseQuery(
    orpc.organization.getActiveOrganization.queryOptions(),
  );
  const confirmationText = organization.name;

  const deleteFormSchema = z.object({
    confirmText: z.string().refine((value) => value === confirmationText, {
      message: "Invalid confirmation",
    }),
  });

  type DeleteFormValues = z.infer<typeof deleteFormSchema>;

  const {
    register,
    handleSubmit,
    formState: { isValid },
    reset,
  } = useForm<DeleteFormValues>({
    resolver: zodResolver(deleteFormSchema),
    defaultValues: {
      confirmText: "",
    },
  });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      reset();
    }
  };

  const onSubmit = async () => {
    try {
      await deleteOrganizationMutation.mutateAsync({
        organizationId: organization?.id,
      });

      await setNextOrg();
      router.refresh();
      setIsOpen(false);

      queryClient.invalidateQueries({
        queryKey: [["organization"]],
      });
    } catch {
      toast.error("Failed to delete organization");
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="text-label-sm text-text-strong-950">
          Delete Organization
        </div>
        <p className="mt-1 text-paragraph-xs text-text-sub-600">
          Permanently delete this organization and all of its data. This action
          cannot be undone.
        </p>
      </div>

      <Button.Root
        mode="stroke"
        onClick={() => setIsOpen(true)}
        variant="error"
      >
        <Button.Icon as={RiDeleteBinLine} />
        Delete Organization
      </Button.Root>

      <Modal.Root onOpenChange={handleOpenChange} open={isOpen}>
        <Modal.Content className="sm:max-w-confirm-dialog">
          <Modal.Header
            description={`Are you sure you want to delete ${confirmationText}?`}
            icon={RiErrorWarningLine}
            title="Delete Organization"
          />

          <Modal.Body>
            <form id="delete-org-form" onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-1 text-paragraph-sm">
                Please type{" "}
                <strong className="font-bold">{confirmationText}</strong> to
                confirm deletion
              </div>

              <Input.Root>
                <Input.Wrapper>
                  <Input.Input
                    {...register("confirmText")}
                    placeholder={confirmationText}
                  />
                </Input.Wrapper>
              </Input.Root>

              <FormGlobalMessage className="mt-4" variant="error">
                This action cannot be undone. All data will be permanently
                deleted.
              </FormGlobalMessage>
            </form>
          </Modal.Body>

          <Modal.Footer>
            <Button.Root
              className="w-full"
              mode="stroke"
              onClick={() => handleOpenChange(false)}
              variant="neutral"
            >
              Cancel
            </Button.Root>
            <Button.Root
              className="w-full"
              disabled={!isValid || deleteOrganizationMutation.isPending}
              form="delete-org-form"
              type="submit"
              variant="error"
            >
              {deleteOrganizationMutation.isPending ? (
                <>
                  <StaggeredFadeLoader variant="muted" />
                  Deleting...
                </>
              ) : (
                "Delete Organization"
              )}
            </Button.Root>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
    </div>
  );
}
