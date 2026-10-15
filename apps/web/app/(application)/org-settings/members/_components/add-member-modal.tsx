"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiErrorWarningFill, RiUserAddLine } from "@repo/ui/icon";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { StaggeredFadeLoader } from "@repo/ui/custom/staggered-fade-loader";
import * as Button from "@repo/ui/button";
import { FormGlobalMessage, FormMessage } from "@repo/ui/form";
import * as Input from "@repo/ui/input";
import * as Label from "@repo/ui/label";
import * as Modal from "@repo/ui/modal";
import * as Radio from "@repo/ui/radio";
import { toast } from "@repo/ui/toast";
import { authClient } from "@/lib/auth/auth-client";
import { useOrganizationInviteMember } from "@/hooks/organization/use-organization-invite-member";

import { useInvalidateOrgMembers } from "../_hooks/use-invalidate-org-members";

interface AddMemberModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMemberModal({ isOpen, onOpenChange }: AddMemberModalProps) {
  const inviteFormSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    role: z.enum(["owner", "admin", "member"]),
    message: z.string().optional(),
  });

  type InviteFormValues = z.infer<typeof inviteFormSchema>;

  const invalidateOrgMembers = useInvalidateOrgMembers();
  const inviteMemberMutation = useOrganizationInviteMember();

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      role: "member",
      message: "",
    },
  });

  const onSubmit = async (values: InviteFormValues) => {
    try {
      const { data: orgData } =
        await authClient.organization.getFullOrganization();

      if (!orgData) {
        const key = "orgSettings.members.errors.noActiveOrg";
        throw Object.assign(new Error(key), { i18nKey: key });
      }

      if (orgData.members.some((m) => m.user.email === values.email)) {
        const key = "orgSettings.members.errors.memberExists";
        throw Object.assign(new Error(key), { i18nKey: key });
      }

      await inviteMemberMutation.mutateAsync({
        email: values.email,
        organizationId: orgData.id,
        role: values.role,
      });

      toast.success(`An invitation has been sent to ${values.email}`);

      invalidateOrgMembers();

      form.reset();
      onOpenChange(false);
    } catch {
      toast.error("Failed to send invitation");
    }
  };

  return (
    <Modal.Root onOpenChange={onOpenChange} open={isOpen}>
      <Modal.Content className="w-full max-w-116">
        <Modal.Header
          description="Set member access and permissions."
          icon={RiUserAddLine}
          title="Invite team member"
        />
        <form className="contents" onSubmit={form.handleSubmit(onSubmit)}>
          <Modal.Body className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <Label.Root
                className="text-label-sm text-text-strong-950"
                htmlFor="email"
              >
                Email
                <Label.Asterisk />
              </Label.Root>
              <Input.Root hasError={!!form.formState.errors.email}>
                <Input.Wrapper>
                  <Input.Input
                    id="email"
                    placeholder="Enter email address"
                    {...form.register("email")}
                  />
                </Input.Wrapper>
              </Input.Root>
              {form.formState.errors.email && (
                <FormMessage>{form.formState.errors.email.message}</FormMessage>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="text-label-sm text-text-strong-950">Role</div>
              <Radio.Group
                className="flex flex-col gap-2"
                onValueChange={(value) =>
                  form.setValue("role", value as "owner" | "admin" | "member")
                }
                value={form.watch("role")}
              >
                <label
                  className="group/radio flex cursor-pointer items-start gap-3"
                  htmlFor="member"
                >
                  <Radio.Item id="member" value="member" />
                  <div className="flex flex-col gap-1">
                    <span className="text-label-sm text-text-strong-950">
                      Member
                    </span>
                    <span className="text-paragraph-sm text-text-sub-600">
                      Standard access to the application
                    </span>
                  </div>
                </label>

                <label
                  className="group/radio flex cursor-pointer items-start gap-3"
                  htmlFor="admin"
                >
                  <Radio.Item id="admin" value="admin" />
                  <div className="flex flex-col gap-1">
                    <span className="text-label-sm text-text-strong-950">
                      Admin
                    </span>
                    <span className="text-paragraph-sm text-text-sub-600">
                      Access to most features except billing
                    </span>
                  </div>
                </label>

                <label
                  className="group/radio flex cursor-pointer items-start gap-3"
                  htmlFor="owner"
                >
                  <Radio.Item id="owner" value="owner" />
                  <div className="flex flex-col gap-1">
                    <span className="text-label-sm text-text-strong-950">
                      Owner
                    </span>
                    <span className="text-paragraph-sm text-text-sub-600">
                      Full access to all settings and billing
                    </span>
                  </div>
                </label>
              </Radio.Group>
            </div>

            {inviteMemberMutation.error && (
              <FormGlobalMessage Icon={RiErrorWarningFill} variant="error">
                Failed to send invitation
              </FormGlobalMessage>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close asChild>
              <Button.Root
                className="w-full"
                mode="stroke"
                size="small"
                variant="neutral"
              >
                Cancel
              </Button.Root>
            </Modal.Close>
            <Button.Root
              className="w-full"
              disabled={inviteMemberMutation.isPending}
              mode="filled"
              size="small"
              type="submit"
              variant="primary"
            >
              {inviteMemberMutation.isPending ? (
                <StaggeredFadeLoader variant="muted" />
              ) : null}
              {inviteMemberMutation.isPending
                ? "Sending Invitation..."
                : "Send Invitation"}
            </Button.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
