"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiErrorWarningFill } from "@repo/ui/icon";
import { AnimatePresence, motion } from "motion/react";
import { containerVariants, headerVariants } from "../animation-constants";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import * as Divider from "@repo/ui/divider";
import { FormGlobalMessage } from "@repo/ui/form";
import { PAGES } from "@/constants/pages";
import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@repo/ui/utils/cn";
import {
  confirm2FASchema,
  verifyBackupCodeSchema,
  verifyEmailOTPSchema,
} from "./validators";

import { BackupStep } from "./backup-step";
import { EmailStep } from "./email-step";
import { RecoveryStep } from "./recovery-step";
import { TOTPStep } from "./totp-step";
import { getStepMeta } from "./step-meta";
import type { AuthError, AuthStep } from "./types";

export default function Confirm2faView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<AuthStep>("totp");
  const [isLoading, setIsLoading] = useState(false);

  // Function to switch steps and clear errors
  const switchStep = (step: AuthStep) => {
    setError(null);
    setCurrentStep(step);
  };

  // Email OTP state
  const [isEmailCodeSent, setIsEmailCodeSent] = useState(false);
  const [isSendingEmailCode, setIsSendingEmailCode] = useState(false);
  const [emailCountdown, setEmailCountdown] = useState(0);

  // Get the return URL from the query parameters
  const returnUrl = searchParams.get("next") || PAGES.APPLICATION.DASHBOARD;

  // TOTP form
  const {
    setValue: setTOTPValue,
    watch: watchTOTP,
    formState: { errors: totpErrors },
    setValue,
    register,
  } = useForm<z.infer<typeof confirm2FASchema>>({
    resolver: zodResolver(confirm2FASchema),
    defaultValues: {
      code: "",
      rememberDevice: false,
    },
  });

  // Backup code form
  const {
    register: registerBackup,
    handleSubmit: handleSubmitBackup,
    formState: { errors: backupErrors, isSubmitting: isBackupSubmitting },
  } = useForm<z.infer<typeof verifyBackupCodeSchema>>({
    resolver: zodResolver(verifyBackupCodeSchema),
    defaultValues: {
      code: "",
    },
  });

  // Email OTP form
  const {
    setValue: setEmailValue,
    watch: watchEmail,
    formState: { errors: emailErrors },
  } = useForm<z.infer<typeof verifyEmailOTPSchema>>({
    resolver: zodResolver(verifyEmailOTPSchema),
    defaultValues: {
      code: "",
    },
  });

  // Handle countdown timer for resending email code
  useEffect(() => {
    if (emailCountdown > 0) {
      const timer = setTimeout(
        () => setEmailCountdown(emailCountdown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [emailCountdown]);

  // Handle API errors
  const handleApiError = useCallback((apiError: AuthError) => {
    setIsLoading(false);

    if (apiError?.code === "INVALID_TOTP_TOKEN") {
      setError("Invalid TOTP code");
    } else if (apiError?.code === "INVALID_BACKUP_CODE") {
      setError("Invalid backup code");
    } else if (apiError?.code === "INVALID_RECOVERY_CODE") {
      setError("Invalid recovery code");
    } else {
      setError(apiError?.message || "Unknown error");
    }
  }, []);

  // Verify TOTP code
  const verifyTOTP = useCallback(
    async (code: string) => {
      setError(null);
      setIsLoading(true);

      const response = await authClient.twoFactor.verifyTotp(
        {
          code,
          trustDevice: watchTOTP("rememberDevice"),
        },
        {
          onError(ctx) {
            handleApiError(ctx.error);
            return;
          },
        },
      );

      if (response.error) {
        handleApiError(response.error);
        return;
      }

      router.push(returnUrl);
    },
    [router, returnUrl, handleApiError, watchTOTP],
  );

  // Verify backup code
  const onSubmitBackup = async (
    data: z.infer<typeof verifyBackupCodeSchema>,
  ) => {
    setError(null);

    const response = await authClient.twoFactor.verifyBackupCode(
      {
        code: data.code,
      },
      {
        onError(ctx) {
          handleApiError(ctx.error);
          return;
        },
      },
    );

    if (response.error) {
      handleApiError(response.error);
      return;
    }

    router.push(returnUrl);
  };

  // Send email OTP code
  const sendEmailOTP = async () => {
    setError(null);
    setIsSendingEmailCode(true);

    await authClient.twoFactor.sendOtp(
      {},
      {
        onError(ctx) {
          handleApiError(ctx.error);
          setIsSendingEmailCode(false);
          return;
        },
      },
    );

    setIsEmailCodeSent(true);
    setEmailCountdown(60); // 60 seconds countdown
    setIsSendingEmailCode(false);
  };

  // Verify email OTP code
  const verifyEmailOTP = async (code: string) => {
    setError(null);
    setIsLoading(true);

    const response = await authClient.twoFactor.verifyOtp(
      {
        code,
      },
      {
        onError(ctx) {
          handleApiError(ctx.error);
          return;
        },
      },
    );

    if (response.error) {
      handleApiError(response.error);
      return;
    }

    router.push(returnUrl);
  };

  // Handle email OTP code change
  const handleEmailOTPChange = (value: string) => {
    setEmailValue("code", value);
    if (value.length === 6) {
      verifyEmailOTP(value);
    }
  };

  const stepMeta = getStepMeta(currentStep);

  return (
    <div className="w-full max-w-118 px-4">
      <section className="flex w-full flex-col gap-6 rounded-20 bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            animate="visible"
            className="flex flex-col items-center gap-2"
            exit="exit"
            initial="hidden"
            key={`header-${currentStep}`}
            layout
            style={{ willChange: "transform, opacity, filter" }}
            transition={{
              layout: {
                duration: 0.35,
                ease: [0.16, 1, 0.3, 1],
              },
            }}
            variants={headerVariants}
          >
            <div
              className={cn(
                "relative flex size-17 shrink-0 items-center justify-center rounded-full backdrop-blur-xl lg:size-24",
                // bg
                "before:absolute before:inset-0 before:rounded-full",
                "before:bg-gradient-to-b before:from-neutral-500 before:to-transparent before:opacity-10",
                "after:absolute after:inset-0 after:rounded-full",
                "after:bg-gradient-to-b after:from-neutral-500 after:to-transparent after:opacity-16",
                "after:mask-exclude after:p-px",
              )}
            >
              <div className="relative z-10 flex size-12 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset lg:size-16">
                {stepMeta.icon}
              </div>
            </div>
            <div className="space-y-1 text-center">
              <div className="text-title-h6 lg:text-title-h5">
                {stepMeta.title}
              </div>
              <div className="text-paragraph-sm text-text-sub-600 lg:text-paragraph-md">
                {stepMeta.description}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <Divider.Root variant="line-spacing" />

        <FormGlobalMessage Icon={RiErrorWarningFill} variant="error">
          {error && error}
        </FormGlobalMessage>

        <AnimatePresence mode="wait">
          <motion.div
            animate="visible"
            className="flex w-full flex-col items-center gap-6"
            exit="exit"
            initial="hidden"
            key={currentStep}
            style={{ willChange: "transform, opacity, filter" }}
            transition={{
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
            variants={containerVariants}
          >
            {currentStep === "totp" && (
              <TOTPStep
                isLoading={isLoading}
                onSwitchStep={switchStep}
                onVerify={verifyTOTP}
                register={register}
                setTOTPValue={setTOTPValue}
                setValue={setValue}
                totpErrors={totpErrors}
                watchTOTP={watchTOTP}
              />
            )}

            {currentStep === "recovery" && (
              <RecoveryStep
                isEmailCodeSent={isEmailCodeSent}
                onSendEmailOTP={sendEmailOTP}
                onSwitchStep={switchStep}
              />
            )}

            {currentStep === "backup" && (
              <BackupStep
                backupErrors={backupErrors}
                handleSubmitBackup={handleSubmitBackup}
                isBackupSubmitting={isBackupSubmitting}
                onSubmitBackup={onSubmitBackup}
                onSwitchStep={switchStep}
                registerBackup={registerBackup}
              />
            )}

            {currentStep === "email" && (
              <EmailStep
                emailCountdown={emailCountdown}
                emailErrors={emailErrors}
                handleEmailOTPChange={handleEmailOTPChange}
                isEmailCodeSent={isEmailCodeSent}
                isLoading={isLoading}
                isSendingEmailCode={isSendingEmailCode}
                onSendEmailOTP={sendEmailOTP}
                onSwitchStep={switchStep}
                verifyEmailOTP={verifyEmailOTP}
                watchEmail={watchEmail}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}
