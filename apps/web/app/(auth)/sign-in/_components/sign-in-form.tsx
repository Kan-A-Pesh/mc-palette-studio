"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  RiCheckboxCircleFill,
  RiErrorWarningFill,
  RiMailLine,
  RiUserFill,
} from "@repo/ui/icon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryStates } from "nuqs";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { PasswordInput } from "@/app/(auth)/_components/password-input";
import sendVerificationOtp from "@/app/(auth)/_lib/send-verification-otp";
import { StaggeredFadeLoader } from "@repo/ui/custom/staggered-fade-loader";
import * as Checkbox from "@repo/ui/checkbox";
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
import { signInSchema } from "./validator";

import { messageParsers } from "../search-params";

export function SignInForm() {
  const router = useRouter();
  const [{ message, error: errorQuery }] = useQueryStates(messageParsers);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(errorQuery);

  const { register, handleSubmit, formState, setValue } = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = (values: z.infer<typeof signInSchema>) => {
    setError(null);
    setIsLoading(true);

    authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        callbackURL: PAGES.APPLICATION.DASHBOARD,
        rememberMe: values.rememberMe,
      },
      {
        onError: (ctx) => {
          if (ctx.error.code === AUTH_ERRORS.EMAIL_NOT_VERIFIED) {
            sendVerificationOtp(values.email)
              .then((redirectUrl) => {
                router.push(redirectUrl);
              })
              .catch((signInError) => {
                setError(signInError as string);
              })
              .finally(() => {
                setIsLoading(false);
              });
          } else if (ctx.error.code === AUTH_ERRORS.INVALID_EMAIL_OR_PASSWORD) {
            setIsLoading(false);
            setError("Invalid credentials");
          } else {
            setIsLoading(false);
            setError(ctx.error.message);
          }
        },
      },
    );
  };

  useEffect(() => {
    if (!PublicKeyCredential.isConditionalMediationAvailable?.()) {
      return;
    }

    authClient.signIn.passkey({
      autoFill: true,
      fetchOptions: {
        onRequest() {
          setIsLoading(true);
        },
        onSuccess() {
          router.push(PAGES.APPLICATION.DASHBOARD);
        },
        onError({ error: passkeyError }) {
          setIsLoading(false);
          setError(passkeyError.message);
        },
      },
    });
  }, [router]);

  return (
    <div className="w-full max-w-118 px-4">
      <section className="flex w-full flex-col gap-6 rounded-20 bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset md:p-8">
        <form
          className="flex w-full flex-col gap-6"
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
                <RiUserFill className="size-6 text-text-sub-600 lg:size-8" />
              </div>
            </div>

            <div className="space-y-1 text-center">
              <div className="text-title-h6 lg:text-title-h5">
                Welcome back!
              </div>
              <div className="text-paragraph-sm text-text-sub-600 lg:text-paragraph-md">
                Sign in to your account
              </div>
            </div>
          </div>

          <Divider.Root />

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Label.Root htmlFor="email">
                Email <Label.Asterisk />
              </Label.Root>
              <Input.Root hasError={!!formState.errors.email}>
                <Input.Wrapper>
                  <Input.Icon as={RiMailLine} />
                  <Input.Input
                    {...register("email")}
                    autoComplete="email webauthn"
                    id="email"
                    placeholder={`hello@${PROJECT.DOMAIN}`}
                    required
                    type="email"
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
                {...register("password")}
                autoComplete="current-password webauthn"
                hasError={!!formState.errors.password}
                id="password"
                required
              />
              <FormMessage>{formState.errors.password?.message}</FormMessage>
            </div>
          </div>

          <FormGlobalMessage Icon={RiErrorWarningFill} variant="error">
            {error}
          </FormGlobalMessage>

          {message && !error && (
            <FormGlobalMessage Icon={RiCheckboxCircleFill} variant="success">
              {message}
            </FormGlobalMessage>
          )}

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-2">
              <Checkbox.Root
                id="agree"
                onCheckedChange={(value) => {
                  setValue("rememberMe", !!value);
                }}
                {...register("rememberMe")}
              />
              <Label.Root
                className="block cursor-pointer text-paragraph-sm"
                htmlFor="agree"
              >
                Remember me
              </Label.Root>
            </div>
            <LinkButton.Root asChild size="medium" underline variant="gray">
              <Link href={PAGES.AUTH.FORGOT_PASSWORD}>Forgot password</Link>
            </LinkButton.Root>
          </div>

          <FancyButton.Root
            disabled={isLoading}
            size="medium"
            variant="primary"
          >
            {isLoading && <StaggeredFadeLoader variant="muted" />}
            {isLoading ? "Signing In" : "Sign In"}
          </FancyButton.Root>
        </form>
      </section>
    </div>
  );
}
