"use client";

import { RiKey2Fill, RiMailLine } from "@repo/ui/icon";
import { motion } from "motion/react";

import * as Button from "@repo/ui/button";
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

interface RecoveryStepProps {
  onSwitchStep: (step: "totp" | "backup" | "email") => void;
  onSendEmailOTP: () => void;
  isEmailCodeSent: boolean;
}

export function RecoveryStep({
  onSwitchStep,
  onSendEmailOTP,
  isEmailCodeSent,
}: RecoveryStepProps) {
  return (
    <>
      <motion.div
        className="w-full space-y-4"
        style={{
          willChange: "transform, opacity, filter",
        }}
        variants={itemVariants}
      >
        <Button.Root
          className="h-auto w-full justify-start p-4"
          mode="stroke"
          onClick={() => onSwitchStep("backup")}
          type="button"
          variant="neutral"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0">
              <RiKey2Fill className="size-5 text-text-sub-600" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="font-medium">Backup Code</span>
              <span className="text-paragraph-xs text-text-sub-600">
                Use one of your backup codes
              </span>
            </div>
          </div>
        </Button.Root>

        <Button.Root
          className="h-auto w-full justify-start p-4"
          mode="stroke"
          onClick={() => {
            onSwitchStep("email");
            if (!isEmailCodeSent) {
              onSendEmailOTP();
            }
          }}
          type="button"
          variant="neutral"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0">
              <RiMailLine className="size-5 text-text-sub-600" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="font-medium">Email Code</span>
              <span className="text-paragraph-xs text-text-sub-600">
                Receive a one-time code via email
              </span>
            </div>
          </div>
        </Button.Root>
      </motion.div>

      <motion.div
        className="w-full"
        style={{
          willChange: "transform, opacity, filter",
        }}
        variants={itemVariants}
      >
        <div className="flex w-full items-center justify-center gap-2">
          <LinkButton.Root
            onClick={() => onSwitchStep("totp")}
            size="medium"
            underline
            variant="gray"
          >
            Back to authenticator
          </LinkButton.Root>
        </div>
      </motion.div>
    </>
  );
}
