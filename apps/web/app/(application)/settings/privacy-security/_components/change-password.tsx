"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiCheckboxCircleFill, RiCloseCircleFill } from "@repo/ui/icon";
import * as React from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { FormPassword } from "@repo/ui/form";
import * as LevelBar from "@/components/util/level-bar";
import { StaggeredFadeLoader } from "@repo/ui/custom/staggered-fade-loader";
import * as Button from "@repo/ui/button";
import * as Divider from "@repo/ui/divider";
import { FormGlobalMessage } from "@repo/ui/form";
import { authClient } from "@/lib/auth/auth-client";
import { changePasswordSchema } from "./validator";
import { UPPERCASE_REGEX, NUMBER_REGEX } from "./change-password-constants";

export default function ChangePassword() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const [criteria, setCriteria] = React.useState({
    length: false,
    uppercase: false,
    number: false,
  });

  const form = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { control, handleSubmit, reset, watch } = form;

  const newPassword = watch("newPassword");

  React.useEffect(() => {
    setCriteria({
      length: newPassword.length >= 8,
      uppercase: UPPERCASE_REGEX.test(newPassword),
      number: NUMBER_REGEX.test(newPassword),
    });
  }, [newPassword]);

  const countTrueCriteria = (criteriaObj: {
    [key: string]: boolean;
  }): number => {
    return Object.values(criteriaObj).filter((value) => value).length;
  };

  const trueCriteriaCount = countTrueCriteria(criteria);

  async function onSubmit(values: z.infer<typeof changePasswordSchema>) {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: changePasswordError } = await authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: true,
      });

      if (changePasswordError) {
        setError(changePasswordError?.message ?? "An error occurred");
        return;
      }

      setSuccess("Password updated successfully");
      reset();
    } catch {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      className="flex w-full flex-col gap-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div>
        <div className="text-label-md">Change Password</div>
        <p className="mt-1 text-paragraph-sm text-text-sub-600">
          Update password for enhanced account security.
        </p>
      </div>

      <Divider.Root variant="line-spacing" />

      <div className="flex flex-col gap-3">
        <FormPassword
          control={control}
          label="Current Password"
          name="currentPassword"
          required
        />

        <FormPassword
          control={control}
          label="New Password"
          name="newPassword"
          required
        />

        <FormPassword
          control={control}
          label="Confirm New Password"
          name="confirmPassword"
          required
        />

        <div className="-mt-0.5 space-y-2">
          <LevelBar.Root level={trueCriteriaCount} levels={3} />
          <div className="text-paragraph-xs text-text-sub-600">
            Must contain at least;
          </div>
          <div className="flex items-center gap-1.5 text-paragraph-xs text-text-sub-600">
            {criteria.uppercase ? (
              <RiCheckboxCircleFill className="size-4 shrink-0 text-success-base" />
            ) : (
              <RiCloseCircleFill className="size-4 shrink-0 text-text-soft-400" />
            )}
            At least 1 uppercase
          </div>
          <div className="flex items-center gap-1.5 text-paragraph-xs text-text-sub-600">
            {criteria.number ? (
              <RiCheckboxCircleFill className="size-4 shrink-0 text-success-base" />
            ) : (
              <RiCloseCircleFill className="size-4 shrink-0 text-text-soft-400" />
            )}
            At least 1 number
          </div>
          <div className="flex items-center gap-1.5 text-paragraph-xs text-text-sub-600">
            {criteria.length ? (
              <RiCheckboxCircleFill className="size-4 shrink-0 text-success-base" />
            ) : (
              <RiCloseCircleFill className="size-4 shrink-0 text-text-soft-400" />
            )}
            At least 8 characters
          </div>
        </div>
      </div>

      {error && !success && (
        <FormGlobalMessage Icon={RiCloseCircleFill} variant="error">
          {error}
        </FormGlobalMessage>
      )}
      {success && (
        <FormGlobalMessage Icon={RiCheckboxCircleFill} variant="success">
          {success}
        </FormGlobalMessage>
      )}

      <div className="mt-1 grid grid-cols-2 gap-3">
        <Button.Root
          mode="stroke"
          onClick={() => reset()}
          type="button"
          variant="neutral"
        >
          Discard
        </Button.Root>
        <Button.Root disabled={isLoading} type="submit">
          {isLoading ? (
            <>
              <StaggeredFadeLoader variant="muted" />
              Applying
            </>
          ) : (
            <>Apply Changes</>
          )}
        </Button.Root>
      </div>
    </form>
  );
}
