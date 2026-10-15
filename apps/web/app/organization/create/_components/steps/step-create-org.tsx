"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiBuilding2Fill } from "@repo/ui/icon";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { OrganizationAvatarUploader } from "@/components/util/organization-avatar-uploader";
import * as Divider from "@repo/ui/divider";
import * as FancyButton from "@repo/ui/fancy-button";
import { FormInput } from "@repo/ui/form";

import {
  useOrgActions,
  useOrgLogo,
  useOrgName,
} from "../../_lib/stores/organization-store";
import {
  useStepCompletion,
  useStepNavigation,
} from "../../_lib/stores/step-store";
import { StepHeader } from "../shared/step-header";
import { createOrgSchema, type CreateOrgValues } from "./create-org-schema";

export default function StepCreateOrg() {
  const { nextStep } = useStepNavigation();
  const { completeStep, incompleteStep } = useStepCompletion();

  const name = useOrgName();
  const logoUrl = useOrgLogo();
  const { setName, setLogoUrl } = useOrgActions();

  const { control, handleSubmit, watch, formState } = useForm<CreateOrgValues>({
    resolver: zodResolver(createOrgSchema),
    mode: "onChange",
    defaultValues: {
      name,
    },
  });

  const watchedName = watch("name");
  const isStepValid = (watchedName ?? "").trim().length > 0;

  // Keep the create-org store in sync so later steps (summary) read the value.
  useEffect(() => {
    setName(watchedName ?? "");
  }, [watchedName, setName]);

  useEffect(() => {
    if (isStepValid) {
      completeStep(0);
    } else {
      incompleteStep(0);
    }
  }, [isStepValid, completeStep, incompleteStep]);

  const handleAvatarChange = (url: string) => {
    setLogoUrl(url);
  };

  const onSubmit = () => {
    if (isStepValid) {
      nextStep();
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-98 flex-col gap-6">
      <StepHeader
        description="Set up your organization profile"
        icon={RiBuilding2Fill}
        title="Create Organization"
      />

      <Divider.Root variant="line-spacing" />

      <OrganizationAvatarUploader
        currentAvatar={logoUrl}
        onAvatarChange={handleAvatarChange}
        organizationName={(watchedName ?? "").trim() || "Organization"}
        size="80"
      />

      <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
        <FormInput
          control={control}
          label="Organization Name"
          name="name"
          placeholder="Acme Corporation"
          required
        />

        <FancyButton.Root
          disabled={!formState.isValid}
          size="medium"
          type="submit"
          variant="primary"
        >
          Continue
        </FancyButton.Root>
      </form>
    </div>
  );
}
