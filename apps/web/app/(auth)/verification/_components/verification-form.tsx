"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiMailCheckFill } from "@repo/ui/icon";
import { useRouter } from "next/navigation";
import { useQueryStates } from "nuqs";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import sendVerificationOtp from "@/app/(auth)/_lib/send-verification-otp";
import { StaggeredFadeLoader } from "@repo/ui/custom/staggered-fade-loader";
import * as DigitInput from "@repo/ui/digit-input";
import * as Divider from "@repo/ui/divider";
import * as FancyButton from "@repo/ui/fancy-button";
import { FormGlobalMessage } from "@repo/ui/form";
import * as LinkButton from "@repo/ui/link-button";
import { AUTH_ERRORS } from "@/constants/auth-errors";
import { PAGES } from "@/constants/pages";
import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@repo/ui/utils/cn";
import { verifyEmailSchema } from "./validator";

import { emailParsers } from "../search-params";

export function VerificationForm() {
  const [{ email, otp }] = useQueryStates(emailParsers);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [resendingStatus, setResendingStatus] = useState<
    "idle" | "loading" | number
  >("idle");

  const { handleSubmit, formState, setValue, watch, setError } = useForm({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = useCallback(
    (values: z.infer<typeof verifyEmailSchema>) => {
      setIsLoading(true);

      authClient.signIn.emailOtp(
        {
          email,
          otp: values.otp,
        },
        {
          onError: (ctx) => {
            switch (ctx.error.code) {
              case AUTH_ERRORS.INVALID_OTP:
                setError("otp", {
                  message: "Invalid OTP Code",
                });
                break;
              default:
                setError("root.resend", {
                  message: ctx.error.message || "Unknown error",
                });
                break;
            }
            setIsLoading(false);
          },
          onSuccess: () => {
            router.push(PAGES.APPLICATION.DASHBOARD);
          },
        },
      );
    },
    [email, router, setError],
  );

  useEffect(() => {
    if (otp) {
      setValue("otp", otp);
      handleSubmit(onSubmit)();
    }
  }, [otp, setValue, handleSubmit, onSubmit]);

  const handleResendCode = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setResendingStatus("loading");

      sendVerificationOtp(email)
        .then((redirectUrl) => {
          router.push(redirectUrl);
        })
        .catch(() => {
          setError("root.resend", {
            message: "Unknown error",
          });
        })
        .finally(() => {
          setResendingStatus(60);
        });
    },
    [email, router, setError],
  );

  useEffect(() => {
    if (otp) {
      setValue("otp", otp);
      handleSubmit(onSubmit)();
    }
  }, [otp, setValue, handleSubmit, onSubmit]);

  useEffect(() => {
    if (typeof resendingStatus === "number") {
      const interval = setInterval(() => {
        setResendingStatus((prev) => {
          const p = prev as number;
          return p > 0 ? p - 1 : "idle";
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [resendingStatus]);

  return (
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
            <RiMailCheckFill className="size-6 text-text-sub-600 lg:size-8" />
          </div>
        </div>

        <div className="space-y-1 text-center">
          <div className="text-title-h6 lg:text-title-h5">
            Enter Verification Code
          </div>
          <div className="text-paragraph-sm text-text-sub-600 lg:text-paragraph-md">
            We&apos;ve sent a code to{" "}
            <span className="font-medium text-text-strong-950">{email}</span>
          </div>
        </div>
      </div>

      <Divider.Root />

      <DigitInput.Root
        hasError={!!formState.errors.otp}
        numInputs={6}
        onChange={(value) => {
          setValue("otp", value);
          if (value.length === 6) {
            handleSubmit(onSubmit)();
          }
        }}
        shouldAutoFocus
        value={watch("otp")}
      />

      <FormGlobalMessage variant="error">
        {formState.errors.otp?.message}
      </FormGlobalMessage>

      <FancyButton.Root disabled={isLoading} size="medium" variant="primary">
        {isLoading ? (
          <>
            <StaggeredFadeLoader variant="muted" /> Verifying
          </>
        ) : (
          <>Submit code</>
        )}
      </FancyButton.Root>

      <div className="flex flex-col items-center gap-1 text-center text-paragraph-sm text-text-sub-600">
        Experiencing issues receiving the code?
        <LinkButton.Root
          className={cn(resendingStatus !== "idle" && "pointer-events-none")}
          disabled={resendingStatus !== "idle"}
          onClick={handleResendCode}
          size="medium"
          underline
          variant="black"
        >
          {resendingStatus === "loading" ? (
            "Resending"
          ) : (
            <>
              Resend code{" "}
              {typeof resendingStatus === "number" && `(${resendingStatus}s)`}
            </>
          )}
        </LinkButton.Root>
      </div>

      <FormGlobalMessage variant="error">
        {formState.errors.root?.resend?.message}
      </FormGlobalMessage>
    </form>
  );
}
