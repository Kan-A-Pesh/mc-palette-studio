"use client";

import { motion } from "motion/react";
import type { FieldErrors, UseFormReturn } from "react-hook-form";

import { StaggeredFadeLoader } from "@repo/ui/custom/staggered-fade-loader";
import * as FancyButton from "@repo/ui/fancy-button";
import { FormMessage } from "@repo/ui/form";
import * as Input from "@repo/ui/input";
import * as Label from "@repo/ui/label";
import * as LinkButton from "@repo/ui/link-button";

// Form values type
type BackupFormValues = {
  code: string;
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

interface BackupStepProps {
  onSubmitBackup: (data: BackupFormValues) => Promise<void>;
  onSwitchStep: (step: "recovery") => void;
  registerBackup: UseFormReturn<BackupFormValues>["register"];
  handleSubmitBackup: UseFormReturn<BackupFormValues>["handleSubmit"];
  backupErrors: FieldErrors<BackupFormValues>;
  isBackupSubmitting: boolean;
}

export function BackupStep({
  onSubmitBackup,
  onSwitchStep,
  registerBackup,
  handleSubmitBackup,
  backupErrors,
  isBackupSubmitting,
}: BackupStepProps) {
  return (
    <motion.div
      className="w-full space-y-6"
      style={{
        willChange: "transform, opacity, filter",
      }}
      variants={itemVariants}
    >
      <form
        className="w-full space-y-6"
        onSubmit={handleSubmitBackup(onSubmitBackup)}
      >
        <div className="space-y-1">
          <Label.Root htmlFor="code">
            Backup Code <Label.Asterisk />
          </Label.Root>
          <Input.Root hasError={!!backupErrors.code}>
            <Input.Wrapper>
              <Input.Input
                autoComplete="one-time-code"
                id="code"
                placeholder="Enter your backup code"
                type="text"
                {...registerBackup("code")}
              />
            </Input.Wrapper>
          </Input.Root>
          {backupErrors.code && (
            <FormMessage>{backupErrors.code.message}</FormMessage>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <FancyButton.Root
            className="w-full"
            disabled={isBackupSubmitting}
            size="medium"
            type="submit"
            variant="primary"
          >
            {isBackupSubmitting && <StaggeredFadeLoader variant="muted" />}
            {isBackupSubmitting ? "Verifying..." : "Verify"}
          </FancyButton.Root>

          <div className="flex w-full items-center justify-center gap-2">
            <LinkButton.Root
              className="flex w-full items-center justify-center"
              onClick={() => onSwitchStep("recovery")}
              size="medium"
              underline
              variant="gray"
            >
              Back to recovery options
            </LinkButton.Root>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
