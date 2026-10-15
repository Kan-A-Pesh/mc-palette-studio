"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiAddLine, RiAlertFill, RiUserAddFill } from "@repo/ui/icon";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import * as Button from "@repo/ui/button";
import * as Divider from "@repo/ui/divider";
import * as FancyButton from "@repo/ui/fancy-button";
import { FormGlobalMessage } from "@repo/ui/form";
import * as LinkButton from "@repo/ui/link-button";
import { useMemberInvitations } from "../../_hooks/use-member-invitations";
import { useStepNavigation } from "../../_lib/stores/step-store";
import { StepHeader } from "../shared/step-header";
import { MemberInvitationItem } from "./member-invitation-item";
import {
  inviteMembersSchema,
  type InviteMembersValues,
} from "./invite-members-schema";

export default function StepInviteMembers() {
  const { nextStep } = useStepNavigation();

  const {
    memberInvitations,
    emailErrors,
    duplicateEmails,
    lastInputRef,
    hasValidEmails,
    addMember,
    removeMember,
    updateMemberEmail,
    updateMemberRole,
    handleKeyDown,
    handlePaste,
    validateEmails,
    showValidation,
  } = useMemberInvitations();

  // react-hook-form owns submit-time validation; the bespoke chips hook above
  // owns the interactive editing (paste-to-split, key-to-add, focus mgmt) and
  // remains the store-backed source of truth for the member rows.
  const { handleSubmit, reset, formState } = useForm<InviteMembersValues>({
    resolver: zodResolver(inviteMembersSchema),
    defaultValues: { members: memberInvitations },
  });

  // Mirror the store rows into RHF so its resolver validates the live values.
  useEffect(() => {
    reset({ members: memberInvitations });
  }, [memberInvitations, reset]);

  const onValid = () => {
    const isValid = validateEmails();

    if (isValid && !duplicateEmails.length && hasValidEmails) {
      nextStep();
    }
  };

  const handleSkip = () => {
    nextStep();
  };

  return (
    <div className="mx-auto flex w-full max-w-98 flex-col gap-6">
      <StepHeader
        description="Invite colleagues to join your organization"
        icon={RiUserAddFill}
        title="Invite Team Members"
      />

      <Divider.Root variant="line-spacing" />

      <form className="flex flex-col gap-6" onSubmit={handleSubmit(onValid)}>
        <div className="space-y-4">
          <div className="space-y-2">
            {memberInvitations.map((member, index) => (
              <MemberInvitationItem
                email={member.email}
                error={showValidation ? emailErrors[index] : undefined}
                index={index}
                isLast={index === memberInvitations.length - 1}
                key={index}
                lastInputRef={lastInputRef}
                onEmailChange={updateMemberEmail}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                onRemove={removeMember}
                onRoleChange={updateMemberRole}
                role={member.role}
              />
            ))}
          </div>

          <Button.Root
            className="w-full"
            mode="ghost"
            onClick={addMember}
            size="small"
            type="button"
            variant="neutral"
          >
            <Button.Icon as={RiAddLine} />
            Add another member
          </Button.Root>
        </div>

        <Divider.Root variant="line-spacing" />

        {duplicateEmails.length > 0 && (
          <FormGlobalMessage Icon={RiAlertFill} variant="error">
            Duplicate email addresses found. Please remove duplicates.
          </FormGlobalMessage>
        )}

        <FancyButton.Root
          disabled={
            formState.isSubmitting ||
            duplicateEmails.length > 0 ||
            !hasValidEmails ||
            memberInvitations.length === 0
          }
          size="medium"
          type="submit"
          variant="primary"
        >
          Invite Members
        </FancyButton.Root>

        {memberInvitations.filter((member) => member.email.trim()).length ===
          0 && (
          <div className="text-center text-paragraph-sm text-text-sub-600">
            Want to fill in later?{" "}
            <LinkButton.Root onClick={handleSkip} underline variant="black">
              Skip this step
            </LinkButton.Root>
          </div>
        )}
      </form>
    </div>
  );
}
