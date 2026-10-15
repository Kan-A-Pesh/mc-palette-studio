"use client";

import {
  RiAlertFill,
  RiCheckboxCircleFill,
  RiErrorWarningFill,
  RiInformationFill,
  RiMagicFill,
} from "@remixicon/react";
import * as React from "react";
import { toast as sonnerToast } from "sonner";
import * as Alert from "@/ui/alert";
import { cn } from "@/utils/cn";

type AlertToastProps = {
  t: string | number;
  status?: React.ComponentPropsWithoutRef<typeof Alert.Root>["status"];
  variant?: React.ComponentPropsWithoutRef<typeof Alert.Root>["variant"];
  message: React.ReactNode;
  dismissable?: boolean;
  icon?: React.ElementType;
};

const AlertToast = React.forwardRef<
  React.ComponentRef<typeof Alert.Root>,
  AlertToastProps
>(
  (
    {
      t,
      status = "feature",
      variant = "stroke",
      message,
      dismissable = true,
      icon,
    },
    forwardedRef,
  ) => {
    let Icon: React.ElementType;

    if (icon) {
      Icon = icon;
    } else {
      switch (status) {
        case "success":
          Icon = RiCheckboxCircleFill;
          break;
        case "warning":
          Icon = RiAlertFill;
          break;
        case "error":
          Icon = RiErrorWarningFill;
          break;
        case "information":
          Icon = RiInformationFill;
          break;
        case "feature":
          Icon = RiMagicFill;
          break;
        default:
          Icon = RiErrorWarningFill;
          break;
      }
    }

    return (
      <Alert.Root
        className={cn("w-[360px]", "transition-colors duration-15 ease-linear")}
        ref={forwardedRef}
        size="small"
        status={status}
        variant={variant}
      >
        <Alert.Icon as={Icon} />
        {message}
        {dismissable && (
          <button onClick={() => sonnerToast.dismiss(t)} type="button">
            <Alert.CloseIcon />
          </button>
        )}
      </Alert.Root>
    );
  },
);
AlertToast.displayName = "AlertToast";

export { AlertToast as Root };
