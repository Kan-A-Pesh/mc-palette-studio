"use client";

import { motion } from "motion/react";
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

import { StaggeredFadeLoader } from "@repo/ui/custom/staggered-fade-loader";
import * as Checkbox from "@repo/ui/checkbox";
import * as DigitInput from "@repo/ui/digit-input";
import * as FancyButton from "@repo/ui/fancy-button";
import { FormMessage } from "@repo/ui/form";
import * as LabelPrimitive from "@repo/ui/label";
import * as LinkButton from "@repo/ui/link-button";

// Form values type
type TOTPFormValues = {
  code: string;
  rememberDevice: boolean;
};

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

interface TOTPStepProps {
  onVerify: (code: string) => void;
  onSwitchStep: (step: "recovery") => void;
  isLoading: boolean;
  watchTOTP: UseFormWatch<TOTPFormValues>;
  setTOTPValue: UseFormSetValue<TOTPFormValues>;
  totpErrors: FieldErrors<TOTPFormValues>;
  register: UseFormRegister<TOTPFormValues>;
  setValue: UseFormSetValue<TOTPFormValues>;
}

export function TOTPStep({
  onVerify,
  onSwitchStep,
  isLoading,
  watchTOTP,
  setTOTPValue,
  totpErrors,
  register,
  setValue,
}: TOTPStepProps) {
  // Handle TOTP code change
  const handleTOTPChange = (value: string) => {
    setTOTPValue("code", value);
    if (value.length === 6) {
      onVerify(value);
    }
  };

  return (
    <>
      <motion.div
        className="w-full"
        style={{
          willChange: "transform, opacity, filter",
        }}
        variants={itemVariants}
      >
        <DigitInput.Root
          disabled={isLoading}
          hasError={!!totpErrors.code}
          numInputs={6}
          onChange={handleTOTPChange}
          shouldAutoFocus
          value={watchTOTP("code")}
        />

        {totpErrors.code && (
          <FormMessage>{totpErrors.code.message}</FormMessage>
        )}
      </motion.div>

      <div className="flex w-full items-start gap-2">
        <Checkbox.Root
          id="rememberDevice"
          onCheckedChange={(value) => {
            setValue("rememberDevice", !!value);
          }}
          {...register("rememberDevice")}
        />
        <LabelPrimitive.Root
          className="block cursor-pointer text-paragraph-sm"
          htmlFor="rememberDevice"
        >
          Remember this device for 60 days
        </LabelPrimitive.Root>
      </div>

      <motion.div
        className="w-full"
        style={{
          willChange: "transform, opacity, filter",
        }}
        variants={itemVariants}
      >
        <FancyButton.Root
          className="w-full"
          disabled={isLoading || watchTOTP("code").length !== 6}
          onClick={() => onVerify(watchTOTP("code"))}
          size="medium"
          type="button"
          variant="primary"
        >
          {isLoading && <StaggeredFadeLoader variant="muted" />}
          {isLoading ? "Verifying..." : "Verify"}
        </FancyButton.Root>
      </motion.div>

      <motion.div
        className="flex w-full flex-col items-center space-y-2 text-center"
        style={{
          willChange: "transform, opacity, filter",
        }}
        variants={itemVariants}
      >
        <p className="text-paragraph-sm text-text-sub-600">
          Don&apos;t have access to your authenticator app?
        </p>
        <LinkButton.Root
          onClick={() => onSwitchStep("recovery")}
          size="medium"
          underline
          variant="gray"
        >
          Try another method
        </LinkButton.Root>
      </motion.div>
    </>
  );
}
