"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  RiErrorWarningFill,
  RiInformationFill,
  RiMailLine,
  RiUserAddFill,
  RiUserLine,
} from "@repo/ui/icon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryStates } from "nuqs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { PasswordInput } from "@/app/(auth)/_components/password-input";
import sendVerificationOtp from "@/app/(auth)/_lib/send-verification-otp";
import { StaggeredFadeLoader } from "@repo/ui/custom/staggered-fade-loader";
import * as Divider from "@repo/ui/divider";
import * as FancyButton from "@repo/ui/fancy-button";
import { FormGlobalMessage, FormMessage } from "@repo/ui/form";
import * as Input from "@repo/ui/input";
import * as Label from "@repo/ui/label";
import * as LinkButton from "@repo/ui/link-button";
import { AUTH_ERRORS } from "@/constants/auth-errors";
import { PAGES } from "@/constants/pages";
import { PROJECT } from "@repo/env/constants";
import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@repo/ui/utils/cn";
import { signUpSchema } from "./validator";

import { signUpParsers } from "../search-params";

export function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [{ signUpEmail, organizationName }] = useQueryStates(signUpParsers);

  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: signUpEmail,
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof signUpSchema>) {
    setError(null);
    setIsLoading(true);

    authClient.signUp.email(
      {
        name: values.fullName,
        email: values.email,
        password: values.password,
      },
      {
        onError: (ctx) => {
          switch (ctx.error.code) {
            case AUTH_ERRORS.USER_ALREADY_EXISTS:
              setError(
                "This email address is already in use, please sign in instead.",
              );
              break;
            default:
              setError(ctx.error.message);
          }
          setIsLoading(false);
        },
        onSuccess: () => {
          sendVerificationOtp(values.email)
            .then((redirectUrl) => {
              router.push(redirectUrl);
            })
            .catch((signUpError) => {
              setIsLoading(false);
              setError(signUpError as string);
            });
        },
      },
    );
  }
  return (
    <div className="w-full max-w-118 px-4">
      <form
        className="flex w-full flex-col gap-6 rounded-20 bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset md:p-8"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col items-center gap-2">
          {/* icon */}
          <div
            className={cn(
              "relative flex size-17 shrink-0 items-center justify-center rounded-full backdrop-blur-xl lg:size-24",
              // bg
              "before:absolute before:inset-0 before:rounded-full",
              "before:bg-gradient-to-b before:from-neutral-500 before:to-transparent before:opacity-10",
            )}
          >
            <div className="relative z-10 flex size-12 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset lg:size-16">
              <RiUserAddFill className="size-6 text-text-sub-600 lg:size-8" />
            </div>
          </div>

          <div className="space-y-1 text-center">
            <div className="text-title-h6 lg:text-title-h5">
              {organizationName
                ? `Join ${organizationName}`
                : "Create a new account"}
            </div>
            <div className="text-paragraph-sm text-text-sub-600 lg:text-paragraph-md">
              {organizationName
                ? `Create an account to join ${organizationName}.`
                : "Enter your details to register."}
            </div>
          </div>
        </div>

        <Divider.Root />

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label.Root htmlFor="fullname">
              Full Name <Label.Asterisk />
            </Label.Root>
            <Input.Root hasError={!!formState.errors.fullName}>
              <Input.Wrapper>
                <Input.Icon as={RiUserLine} />
                <Input.Input
                  id="fullname"
                  placeholder="James Brown"
                  required
                  type="text"
                  {...register("fullName")}
                />
              </Input.Wrapper>
            </Input.Root>
            <FormMessage>{formState.errors.fullName?.message}</FormMessage>
          </div>

          <div className="flex flex-col gap-1">
            <Label.Root htmlFor="email">
              Email Address <Label.Asterisk />
            </Label.Root>
            <Input.Root hasError={!!formState.errors.email}>
              <Input.Wrapper>
                <Input.Icon as={RiMailLine} />
                <Input.Input
                  disabled={!!signUpEmail}
                  id="email"
                  placeholder={`hello@${PROJECT.DOMAIN}`}
                  required
                  type="email"
                  {...register("email")}
                />
              </Input.Wrapper>
            </Input.Root>
            <FormMessage>{formState.errors.email?.message}</FormMessage>
          </div>

          <div className="flex flex-col gap-1">
            <Label.Root htmlFor="password">
              Password <Label.Asterisk />
            </Label.Root>
            <PasswordInput
              hasError={!!formState.errors.password}
              id="password"
              required
              {...register("password")}
            />
            {formState.errors.password ? (
              <FormMessage>{formState.errors.password.message}</FormMessage>
            ) : (
              <div className="flex gap-1 text-paragraph-xs text-text-sub-600">
                <RiInformationFill className="size-4 shrink-0 text-text-soft-400" />
                Must contain 1 uppercase letter, 1 number, min. 8 characters.
              </div>
            )}
          </div>
        </div>

        <FormGlobalMessage Icon={RiErrorWarningFill} variant="error">
          {error}
        </FormGlobalMessage>

        <FancyButton.Root disabled={isLoading} size="medium" variant="primary">
          {isLoading && <StaggeredFadeLoader variant="muted" />}
          Register
        </FancyButton.Root>

        <div className="text-center text-paragraph-sm text-text-sub-600">
          {`By clicking Register, you agree to accept ${PROJECT.NAME}`}
          <div className="inline-block pt-1 align-baseline">
            <Link href={PAGES.MARKETING.TERMS_AND_CONDITIONS}>
              <LinkButton.Root
                className="px-1"
                size="medium"
                underline
                variant="black"
              >
                Terms of Service
              </LinkButton.Root>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
