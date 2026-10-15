"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import * as React from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { OrganizationAvatarUploader } from "@/components/util/organization-avatar-uploader";
import { SaveButton } from "@repo/ui/custom/save-button";
import * as Button from "@repo/ui/button";
import * as Divider from "@repo/ui/divider";
import { FormGlobalMessage, FormMessage } from "@repo/ui/form";
import * as Input from "@repo/ui/input";
import * as Label from "@repo/ui/label";
import { PROJECT } from "@repo/env/constants";
import { authClient } from "@/lib/auth/auth-client";
import { findNextAvailableSlug } from "@/lib/auth/find-next-available-slug";
import { orpc } from "@/orpc/client";
import { updateOrganizationProfileSchema } from "./validator";

type UpdatedFields = {
  name?: string;
  slug?: string;
  logo?: string;
};

type ProfileFormValues = z.infer<typeof updateOrganizationProfileSchema>;

export default function Details() {
  const { data: organization } = useSuspenseQuery(
    orpc.organization.getActiveOrganization.queryOptions(),
  );

  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const uniqueId = React.useId();

  const initialValues = React.useMemo(
    () => ({
      name: organization?.name,
    }),
    [organization],
  );

  const { register, handleSubmit, reset, formState, setError } =
    useForm<ProfileFormValues>({
      resolver: zodResolver(updateOrganizationProfileSchema),
      defaultValues: initialValues,
    });

  React.useEffect(() => {
    if (organization) {
      reset({
        name: organization.name,
      });
    }
  }, [organization, reset]);

  const handleSave = async (values: ProfileFormValues) => {
    setIsSubmitting(true);
    const updatedFields: Partial<UpdatedFields> = {};

    try {
      if (values.name.trim() !== organization?.name) {
        try {
          const slug = await findNextAvailableSlug(values.name.trim());

          updatedFields.name = values.name.trim();
          updatedFields.slug = slug;
        } catch (error) {
          setError("name", error as Error);
          setIsSubmitting(false);
          return;
        }
      }

      if (Object.keys(updatedFields).length === 0) {
        setIsSubmitting(false);
        return;
      }

      await authClient.organization.update({
        organizationId: organization.id,
        data: {
          name: updatedFields.name,
          slug: updatedFields.slug,
          logo: updatedFields.logo,
        },
      });

      await queryClient.invalidateQueries({
        queryKey: [["organization"]],
      });
      reset(updatedFields);
    } catch (error) {
      setError(
        "root",
        new Error(
          `Please contact ${PROJECT.HELP_EMAIL} with error code: ${error}`,
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    if (organization) {
      reset({
        name: organization.name || "",
      });
    }
  };

  const handleAvatarChange = async (avatarUrl: string) => {
    try {
      await authClient.organization.update({
        organizationId: organization.id,
        data: {
          logo: avatarUrl,
        },
      });

      await queryClient.invalidateQueries({
        queryKey: [["organization"]],
      });
    } catch (error) {
      setError(
        "root",
        new Error(
          `Please contact ${PROJECT.HELP_EMAIL} with error code: ${error}`,
        ),
      );
    }
  };

  const displayAvatar = organization.logo;
  const isDirty = formState.isDirty;

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Profile Photo */}
      <div className="flex flex-col gap-4">
        <OrganizationAvatarUploader
          currentAvatar={displayAvatar}
          onAvatarChange={handleAvatarChange}
          organizationName={organization?.name}
          size="64"
        />

        <Divider.Root variant="line-spacing" />
      </div>

      {/* Personal Information */}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(handleSave)}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label.Root htmlFor={`${uniqueId}-fullname`}>
              Organization Name <Label.Asterisk />
            </Label.Root>

            <Input.Root hasError={!!formState.errors.name}>
              <Input.Wrapper>
                <Input.Input
                  id={`${uniqueId}-fullname`}
                  {...register("name")}
                />
              </Input.Wrapper>
            </Input.Root>
            <FormMessage>{formState.errors.name?.message}</FormMessage>
          </div>
        </div>

        <FormGlobalMessage variant="error">
          {formState.errors.root?.message}
        </FormGlobalMessage>

        <div className="mt-1 grid grid-cols-2 gap-3">
          <Button.Root
            disabled={!isDirty || isSubmitting}
            mode="stroke"
            onClick={handleDiscard}
            type="button"
            variant="neutral"
          >
            Discard
          </Button.Root>
          <SaveButton
            isDirty={isDirty}
            isPending={isSubmitting}
            type="submit"
          />
        </div>
      </form>
    </div>
  );
}
