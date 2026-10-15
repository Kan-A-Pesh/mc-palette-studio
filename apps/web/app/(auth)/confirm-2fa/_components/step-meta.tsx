import { RiKey2Fill, RiMailLine, RiShieldKeyholeLine } from "@repo/ui/icon";

import type { AuthStep } from "./types";

type StepMeta = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

export function getStepMeta(step: AuthStep): StepMeta {
  switch (step) {
    case "totp":
      return {
        icon: (
          <RiShieldKeyholeLine className="size-6 text-text-sub-600 lg:size-8" />
        ),
        title: "Authenticator Verification",
        description: "Enter the 6-digit code from your authenticator app",
      };
    case "backup":
      return {
        icon: <RiKey2Fill className="size-6 text-text-sub-600 lg:size-8" />,
        title: "Backup Code Verification",
        description:
          "Enter one of your backup codes. Each code can only be used once.",
      };
    case "email":
      return {
        icon: <RiMailLine className="size-6 text-text-sub-600 lg:size-8" />,
        title: "Email Verification",
        description: "We'll send a verification code to your email address",
      };
    case "recovery":
      return {
        icon: (
          <RiShieldKeyholeLine className="size-6 text-text-sub-600 lg:size-8" />
        ),
        title: "Account Recovery",
        description: "Choose an alternative method to verify your identity",
      };
    default:
      return {
        icon: (
          <RiShieldKeyholeLine className="size-6 text-text-sub-600 lg:size-8" />
        ),
        title: "Two-Factor Authentication",
        description: "Verify your identity to continue",
      };
  }
}
