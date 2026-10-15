"use client";

import {
  RiAlertFill,
  RiBuilding2Line,
  RiCheckboxCircleFill,
  RiPencilLine,
  RiTeamLine,
} from "@repo/ui/icon";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

import { StaggeredFadeLoader } from "@repo/ui/custom/staggered-fade-loader";
import * as Button from "@repo/ui/button";
import * as Divider from "@repo/ui/divider";
import * as FancyButton from "@repo/ui/fancy-button";
import { FormGlobalMessage } from "@repo/ui/form";
import { PAGES } from "@/constants/pages";
import { useOrganizationCreate } from "@/hooks/organization/use-organization-create";
import { useOrganizationInviteMember } from "@/hooks/organization/use-organization-invite-member";
import { useOrganizationSetActive } from "@/hooks/organization/use-organization-set-active";
import { findNextAvailableSlug } from "@/lib/auth/find-next-available-slug";
import { cn } from "@repo/ui/utils/cn";

import { useCreateOrgStore } from "../../_lib/stores/organization-store";
import { useStepStore } from "../../_lib/stores/step-store";

export default function StepSummary() {
  const { setActiveStep } = useStepStore();
  const { name, logoUrl, memberInvitations } = useCreateOrgStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const createOrgMutation = useOrganizationCreate();
  const setActiveMutation = useOrganizationSetActive();
  const inviteMemberMutation = useOrganizationInviteMember();

  useEffect(() => {
    if (!name || name.trim() === "") {
      setError("Organization name is required");
    } else {
      setError(null);
    }
  }, [name]);

  const validMembers = useMemo(
    () =>
      memberInvitations.filter(
        (member) =>
          member.email.trim() !== "" &&
          z.string().email().safeParse(member.email).success,
      ),
    [memberInvitations],
  );

  const handleCompleteSetup = async () => {
    if (!name || name.trim() === "") {
      setError("Organization name is required");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let slug: string;

    try {
      slug = await findNextAvailableSlug(name.trim());
    } catch (error) {
      setError((error as Error).message ?? "Failed to create organization");
      setIsLoading(false);
      return;
    }

    try {
      const { data: org } = await createOrgMutation.mutateAsync({
        name: name.trim(),
        slug,
        logo: logoUrl ?? undefined,
      });

      await Promise.all(
        validMembers.map(
          async (member) =>
            await inviteMemberMutation.mutateAsync({
              email: member.email,
              organizationId: org.id,
              role: member.role,
              resend: true,
            }),
        ),
      );

      await setActiveMutation.mutateAsync({
        organizationId: org.id,
      });
    } catch (orgError) {
      setError((orgError as Error).message ?? "Failed to create organization");
      setIsLoading(false);
      return;
    }

    queryClient.invalidateQueries({
      queryKey: [["organization"]],
    });

    router.push(PAGES.APPLICATION.DASHBOARD);
  };

  return (
    <div className="mx-auto flex w-full max-w-98 flex-col gap-6">
      <div className="flex flex-col items-center space-y-2">
        {/* icon */}
        <div
          className={cn(
            "relative flex size-17 shrink-0 items-center justify-center rounded-full backdrop-blur-xl lg:size-24",
            // bg
            "before:absolute before:inset-0 before:rounded-full",
            "before:bg-gradient-to-b before:from-neutral-500 before:to-transparent before:opacity-10",
            // stroke
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-gradient-to-b after:from-neutral-500 after:to-transparent after:opacity-16",
            "after:mask-exclude after:p-px",
          )}
        >
          <div className="relative z-10 flex size-12 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset lg:size-16">
            <RiCheckboxCircleFill className="size-6 text-text-sub-600 lg:size-8" />
          </div>
        </div>

        <div className="space-y-1 text-center">
          <div className="text-title-h6 lg:text-title-h5">Review</div>
          <div className="text-paragraph-sm text-text-sub-600 lg:text-paragraph-md">
            Confirm your organization details
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl bg-bg-white-0 px-4 py-4 ring-1 ring-stroke-soft-200 ring-inset">
        {/* Organization Avatar and Name */}
        <div className="flex items-center gap-3">
          <div className="flex flex-1 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-faded-lighter">
              <RiBuilding2Line className="size-5 text-text-sub-600" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="text-subheading-xs text-text-sub-600 uppercase">
                Organization
              </div>
              <div className="text-label-sm">{name.trim()}</div>
            </div>
          </div>
          <Button.Root
            mode="ghost"
            onClick={() => setActiveStep(0)}
            size="xsmall"
            variant="neutral"
          >
            <Button.Icon as={RiPencilLine} />
          </Button.Root>
        </div>

        {validMembers.length > 0 && (
          <>
            <Divider.Root variant="line-spacing" />

            {/* Team Members */}
            <div className="flex items-start gap-3">
              <div className="flex flex-1 items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-faded-lighter">
                  <RiTeamLine className="size-5 text-text-sub-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="mb-1 text-subheading-xs text-text-sub-600 uppercase">
                    {validMembers.length === 1 ? "Team Member" : "Team Members"}
                  </div>
                  <div className="space-y-1">
                    {validMembers.map((member, index) => (
                      <div className="flex items-center gap-2" key={index}>
                        <span className="flex-1 truncate text-label-sm">
                          {member.email}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Button.Root
                mode="ghost"
                onClick={() => setActiveStep(1)}
                size="xsmall"
                variant="neutral"
              >
                <Button.Icon as={RiPencilLine} />
              </Button.Root>
            </div>
          </>
        )}
      </div>

      <FormGlobalMessage Icon={RiAlertFill} variant="error">
        {error}
      </FormGlobalMessage>

      <FancyButton.Root
        disabled={isLoading || !!error || !name || name.trim() === ""}
        onClick={handleCompleteSetup}
        size="medium"
        variant="primary"
      >
        {isLoading && <StaggeredFadeLoader variant="muted" />}
        {isLoading ? "Completing..." : "Complete Setup"}
      </FancyButton.Root>
    </div>
  );
}
