"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  RiCheckboxCircleFill,
  RiCloseCircleFill,
  RiLockFill,
} from "@repo/ui/icon";
import { useRouter } from "next/navigation";
import { useQueryStates } from "nuqs";
import * as React from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { PasswordInput } from "@/app/(auth)/_components/password-input";
import * as LevelBar from "@/components/util/level-bar";
import { StaggeredFadeLoader } from "@repo/ui/custom/staggered-fade-loader";
import * as Divider from "@repo/ui/divider";
import * as FancyButton from "@repo/ui/fancy-button";
import { FormMessage } from "@repo/ui/form";
import * as Label from "@repo/ui/label";
import { PAGES } from "@/constants/pages";
import { cn } from "@repo/ui/utils/cn";
import { authClient } from "@/lib/auth/auth-client";
import { resetPasswordSchema } from "./validator";

import { resetPasswordParsers } from "../search-params";

const UPPERCASE_REGEX = /[A-Z]/;
const NUMBER_REGEX = /[0-9]/;

export function ResetPasswordForm() {
  const [{ token }] = useQueryStates(resetPasswordParsers);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const [criteria, setCriteria] = React.useState({
    length: false,
    uppercase: false,
    number: false,
  });

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue("password", value);
    setCriteria({
      length: value.length >= 8,
      uppercase: UPPERCASE_REGEX.test(value),
      number: NUMBER_REGEX.test(value),
    });
  };

  const countTrueCriteria = (criteriaObj: {
    [key: string]: boolean;
  }): number => {
    return Object.values(criteriaObj).filter((value) => value).length;
  };

  const trueCriteriaCount = countTrueCriteria(criteria);

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    setIsLoading(true);
    if (!token) {
      return;
    }

    await authClient.resetPassword(
      {
        newPassword: values.password,
        token,
      },
      {
        onError: (ctx) => {
          form.setError("password", {
            message: ctx.error.message,
          });
          setIsLoading(false);
        },
        onSuccess: () => {
          router.push(
            PAGES.AUTH.SIGN_IN +
              "?message=" +
              encodeURIComponent("Your password has been changed"),
          );
        },
      },
    );
  }

  return (
    <form
      className="flex w-full flex-col gap-6 rounded-20 bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset md:p-8"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {/* Icon and title section */}
      <div className="flex flex-col items-center space-y-2">
        <div
          className={cn(
            "relative flex size-17 shrink-0 items-center justify-center rounded-full backdrop-blur-xl lg:size-24",
            "before:absolute before:inset-0 before:rounded-full",
            "before:bg-gradient-to-b before:from-neutral-500 before:to-transparent before:opacity-10",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-gradient-to-b after:from-neutral-500 after:to-transparent after:opacity-16",
            "after:mask-exclude after:p-px",
          )}
        >
          <div className="relative z-10 flex size-12 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset lg:size-16">
            <RiLockFill className="size-6 text-text-sub-600 lg:size-8" />
          </div>
        </div>

        <div className="space-y-1 text-center">
          <div className="text-title-h6 lg:text-title-h5">Reset Password</div>
          <div className="text-paragraph-sm text-text-sub-600 lg:text-paragraph-md">
            Create a new password for your account.
          </div>
        </div>
      </div>

      <Divider.Root variant="line-spacing" />

      {/* Password inputs */}
      <div className="space-y-3">
        <div className="space-y-1">
          <Label.Root htmlFor="password">
            New Password <Label.Asterisk />
          </Label.Root>
          <PasswordInput
            id="password"
            {...form.register("password")}
            onChange={handlePasswordChange}
          />
          {form.formState.errors.password && (
            <FormMessage variant="error">
              {form.formState.errors.password.message}
            </FormMessage>
          )}
        </div>

        <div className="space-y-1">
          <Label.Root htmlFor="confirm-password">
            Confirm Password <Label.Asterisk />
          </Label.Root>
          <PasswordInput
            id="confirm-password"
            {...form.register("confirmPassword")}
          />
          {form.formState.errors.confirmPassword && (
            <FormMessage variant="error">
              {form.formState.errors.confirmPassword.message}
            </FormMessage>
          )}
        </div>

        {/* Password criteria */}
        <div className="mt-2.5 space-y-2">
          <LevelBar.Root level={trueCriteriaCount} levels={3} />
          <div className="text-paragraph-xs text-text-sub-600">
            Must contain at least;
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 text-paragraph-xs text-text-sub-600",
            )}
          >
            {criteria.uppercase ? (
              <RiCheckboxCircleFill className="size-4 shrink-0 text-success-base" />
            ) : (
              <RiCloseCircleFill className="size-4 shrink-0 text-text-soft-400" />
            )}
            At least 1 uppercase
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 text-paragraph-xs text-text-sub-600",
            )}
          >
            {criteria.number ? (
              <RiCheckboxCircleFill className="size-4 shrink-0 text-success-base" />
            ) : (
              <RiCloseCircleFill className="size-4 shrink-0 text-text-soft-400" />
            )}
            At least 1 number
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 text-paragraph-xs text-text-sub-600",
            )}
          >
            {criteria.length ? (
              <RiCheckboxCircleFill className="size-4 shrink-0 text-success-base" />
            ) : (
              <RiCloseCircleFill className="size-4 shrink-0 text-text-soft-400" />
            )}
            At least 8 characters
          </div>
        </div>
      </div>

      <FancyButton.Root disabled={isLoading} size="medium" variant="primary">
        {isLoading ? (
          <>
            <StaggeredFadeLoader variant="muted" />
            Resetting password...
          </>
        ) : (
          <>Reset Password</>
        )}
      </FancyButton.Root>
    </form>
  );
}
