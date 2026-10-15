"use client";

import { RiMailSendLine } from "@repo/ui/icon";
import { motion } from "motion/react";
import type { FieldErrors } from "react-hook-form";

import { StaggeredFadeLoader } from "@repo/ui/custom/staggered-fade-loader";
import * as Button from "@repo/ui/button";
import * as DigitInput from "@repo/ui/digit-input";
import * as FancyButton from "@repo/ui/fancy-button";
import { FormMessage } from "@repo/ui/form";
import * as LinkButton from "@repo/ui/link-button";

// Animation variants
const itemVariants = {
  hidden: { opacity: 0, y: 12, filter: "blur(5px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.25,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(5px)",
    transition: {
      duration: 0.2,
      ease: [0.32, 0, 0.67, 0],
    },
  },
} as const;

interface EmailStepProps {
  isEmailCodeSent: boolean;
  onSendEmailOTP: () => void;
  isSendingEmailCode: boolean;
  emailErrors: FieldErrors<{ code: string }>;
  watchEmail: (field: string) => string;
  handleEmailOTPChange: (value: string) => void;
  isLoading: boolean;
  verifyEmailOTP: (code: string) => void;
  emailCountdown: number;
  onSwitchStep: (step: "recovery") => void;
}

export function EmailStep({
  isEmailCodeSent,
  onSendEmailOTP,
  isSendingEmailCode,
  emailErrors,
  watchEmail,
  handleEmailOTPChange,
  isLoading,
  verifyEmailOTP,
  emailCountdown,
  onSwitchStep,
}: EmailStepProps) {
  return (
    <motion.div
      className="w-full space-y-6"
      style={{
        willChange: "transform, opacity, filter",
      }}
      variants={itemVariants}
    >
      {isEmailCodeSent ? (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-paragraph-sm text-text-sub-600">
              We&apos;ve sent a verification code to your email address. Enter
              the code below.
            </p>
          </div>

          <DigitInput.Root
            disabled={isLoading}
            hasError={!!emailErrors.code}
            numInputs={6}
            onChange={handleEmailOTPChange}
            shouldAutoFocus
            value={watchEmail("code")}
          />

          {emailErrors.code && (
            <FormMessage>{emailErrors.code.message}</FormMessage>
          )}

          <div className="flex flex-col gap-3">
            <FancyButton.Root
              className="w-full"
              disabled={isLoading || watchEmail("code").length !== 6}
              onClick={() => verifyEmailOTP(watchEmail("code"))}
              size="medium"
              type="button"
              variant="primary"
            >
              {isLoading && <StaggeredFadeLoader variant="muted" />}
              {isLoading ? "Verifying..." : "Verify"}
            </FancyButton.Root>

            <Button.Root
              className="w-full"
              disabled={emailCountdown > 0 || isSendingEmailCode}
              mode="stroke"
              onClick={onSendEmailOTP}
              type="button"
              variant="neutral"
            >
              <Button.Icon as={RiMailSendLine} />
              {(() => {
                if (emailCountdown > 0) {
                  return `Resend code (${emailCountdown}s)`;
                }
                if (isSendingEmailCode) {
                  return "Sending...";
                }
                return "Resend code";
              })()}
            </Button.Root>
          </div>
        </div>
      ) : (
        <div className="w-full space-y-6">
          <div className="text-center">
            <p className="text-paragraph-sm text-text-sub-600">
              We&apos;ll send a verification code to your email address
            </p>
          </div>

          <FancyButton.Root
            className="w-full"
            disabled={isSendingEmailCode}
            onClick={onSendEmailOTP}
            size="medium"
            type="button"
            variant="primary"
          >
            {isSendingEmailCode && <StaggeredFadeLoader variant="muted" />}
            {isSendingEmailCode ? "Sending..." : "Send verification code"}
          </FancyButton.Root>
        </div>
      )}

      <LinkButton.Root
        className="flex w-full items-center justify-center"
        onClick={() => onSwitchStep("recovery")}
        size="medium"
        underline
        variant="gray"
      >
        Back to recovery options
      </LinkButton.Root>
    </motion.div>
  );
}
