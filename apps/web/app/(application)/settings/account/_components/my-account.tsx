"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiErrorWarningLine, RiMailCheckFill } from "@repo/ui/icon";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import * as React from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { UserAvatarUploader } from "@/components/util/user-avatar-uploader";
import { SaveButton } from "@repo/ui/custom/save-button";
import { FormInput } from "@repo/ui/form";
import { PhoneNumberInput } from "@repo/ui/custom/phone-number-input";
import * as Button from "@repo/ui/button";
import * as Divider from "@repo/ui/divider";
import { FormGlobalMessage, FormMessage } from "@repo/ui/form";
import { InfoCircleFilled } from "@repo/ui/icons";
import * as Label from "@repo/ui/label";
import * as Tooltip from "@repo/ui/tooltip";
import { AUTH_ERRORS } from "@/constants/auth-errors";
import { PROJECT } from "@repo/env/constants";
import { authClient } from "@/lib/auth/auth-client";
import { orpc } from "@/orpc/client";
import { updateUserProfileSchema } from "./validator";

type ProfileFormValues = z.infer<typeof updateUserProfileSchema>;

export default function MyAccount() {
  const queryClient = useQueryClient();

  const { data: user, error: sessionError } = useSuspenseQuery(
    orpc.user.getMe.queryOptions(),
  );

  const uniqueId = React.useId();
  const [globalError, setGlobalError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const initialValues = React.useMemo(
    () => ({
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    }),
    [user],
  );

  const invalidateQueries = () => {
    queryClient.invalidateQueries({
      queryKey: [["user"]],
    });
    queryClient.invalidateQueries({
      queryKey: [["organization"]],
    });
  };
  const {
    register,
    handleSubmit,
    reset,
    formState,
    setError,
    watch,
    setValue,
    getValues,
    control,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: initialValues,
  });

  // Get the current phone value from the form
  const phoneValue = watch("phone");

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: This is a complex form with multiple fields and validation
  const handleSave = async (values: ProfileFormValues) => {
    setGlobalError(null);
    setMessage(null);
    setIsSubmitting(true);

    let emailSuccess = false;
    let profileSuccess = false;

    try {
      if (formState.dirtyFields.email) {
        await authClient.changeEmail(
          {
            newEmail: values.email,
            callbackURL: "/settings/account?email-updated=true",
          },
          {
            onSuccess() {
              emailSuccess = true;
              setMessage(
                "We've sent you a verification email to confirm your new email address.",
              );
            },
            onError(context) {
              if (context.error.code === AUTH_ERRORS.EMAIL_ALREADY_IN_USE) {
                setError("email", {
                  message: "Email already in use",
                });
              } else if (
                context.error.code === AUTH_ERRORS.COULDNT_UPDATE_YOUR_EMAIL
              ) {
                setError("email", {
                  message: "Could not update your email",
                });
              } else {
                setGlobalError(
                  `Please contact ${PROJECT.HELP_EMAIL} with error code: ${context.error.code}`,
                );
              }
            },
          },
        );
      }

      if (formState.dirtyFields.name || formState.dirtyFields.phone) {
        await authClient.updateUser(
          {
            name: values.name,
            phone: values.phone,
          },
          {
            onSuccess() {
              profileSuccess = true;
            },
            onError({ error }) {
              setGlobalError(
                `Please contact ${PROJECT.HELP_EMAIL} with error code: ${error.code}`,
              );
            },
          },
        );
      }

      if (emailSuccess || profileSuccess) {
        reset({
          name: profileSuccess ? values.name : getValues("name"),
          phone: profileSuccess ? values.phone : getValues("phone"),
          email: emailSuccess ? values.email : getValues("email"),
        });
      }

      invalidateQueries();
    } catch (error) {
      setGlobalError(
        `Please contact ${PROJECT.HELP_EMAIL} with error code: ${error}`,
      );
    } finally {
      setIsSubmitting(false);
      queryClient.invalidateQueries({
        queryKey: [["user"]],
      });
    }
  };

  const handleDiscard = () => {
    // Reset form to original values
    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  };

  const handleAvatarChange = async (avatarUrl: string) => {
    try {
      await authClient.updateUser({
        image: avatarUrl,
      });
      invalidateQueries();
    } catch (error) {
      setGlobalError(
        `Please contact ${PROJECT.HELP_EMAIL} with error code: ${error}`,
      );
    }
  };

  // Error state
  if (sessionError) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-6 rounded-lg border border-error-light bg-error-lighter p-8">
        <div className="flex flex-col items-center gap-4">
          <RiErrorWarningLine className="size-12 text-error-base" />
          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-error-dark text-label-lg">Session Error</h3>
            <p className="text-error-base text-paragraph-md">
              Could not load your profile. Please try again later.
            </p>
          </div>
        </div>
        <Button.Root
          className="w-full max-w-50"
          mode="filled"
          onClick={() => window.location.reload()}
          size="xsmall"
          variant="error"
        >
          Reload Page
        </Button.Root>
      </div>
    );
  }

  const displayAvatar = user?.image;
  const isDirty = formState.isDirty;

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Profile Photo */}
      <div className="flex flex-col gap-4">
        <UserAvatarUploader
          currentAvatar={displayAvatar}
          onAvatarChange={handleAvatarChange}
          size="64"
          username={user?.name ?? "Unknown User"}
        />

        <Divider.Root variant="line-spacing" />
      </div>

      {/* Personal Information */}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(handleSave)}>
        <div className="flex flex-col gap-3">
          <FormInput control={control} label="Name" name="name" required />

          <FormInput
            control={control}
            label="Email Address"
            name="email"
            required
            type="email"
          />

          <div className="flex flex-col gap-1">
            <Label.Root htmlFor={`${uniqueId}-phone`}>
              Phone Number <Label.Sub>(Optional)</Label.Sub>
              <Tooltip.Root>
                <Tooltip.Trigger>
                  <InfoCircleFilled className="size-5 text-text-disabled-300" />
                </Tooltip.Trigger>
                <Tooltip.Content side="top" size="xsmall">
                  Enter your phone number without the country code, as it is
                  selected separately. Only numbers are allowed.
                </Tooltip.Content>
              </Tooltip.Root>
            </Label.Root>
            <PhoneNumberInput
              hasError={!!formState.errors.phone}
              inputId={`${uniqueId}-phone`}
              onBlur={register("phone").onBlur}
              onChange={(value, isValid) => {
                if (isValid && value) {
                  // Use setValue to update the form value with international format
                  // This is what will be saved to the database
                  setValue("phone", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }
              }}
              value={phoneValue || ""}
            />
            {formState.errors.phone && (
              <FormMessage>{formState.errors.phone.message}</FormMessage>
            )}
          </div>
        </div>

        <FormGlobalMessage variant="error">{globalError}</FormGlobalMessage>

        {message && !globalError && (
          <FormGlobalMessage Icon={RiMailCheckFill} variant="success">
            {message}
          </FormGlobalMessage>
        )}

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
