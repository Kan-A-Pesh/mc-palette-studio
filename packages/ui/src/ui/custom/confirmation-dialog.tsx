"use client";

import * as DialogPrimitives from "@radix-ui/react-dialog";
import {
  type RemixiconComponentType,
  RiAlertFill,
  RiErrorWarningFill,
} from "@remixicon/react";

import * as Button from "@/ui/button";
import * as Modal from "@/ui/modal";
import { cn } from "@/utils/cn";

import { StaggeredFadeLoader } from "@/ui/custom/staggered-fade-loader";

export type ConfirmationDialogProps = {
  title: string;
  description: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  cancelText?: string;
  confirmText?: string;
  isLoading?: boolean;
  variant?: "danger" | "warning" | "info";
  icon?: RemixiconComponentType;
  showClose?: boolean;
};

export function ConfirmationDialog({
  title,
  description,
  open,
  onOpenChange,
  onConfirm,
  cancelText = "Cancel",
  confirmText = "Confirm",
  isLoading = false,
  variant = "danger",
  icon,
  showClose = false,
}: ConfirmationDialogProps) {
  let IconComponent: RemixiconComponentType = icon || RiErrorWarningFill;
  let iconContainerClass = "bg-error-lighter";
  let iconClass = "text-error-base";
  let buttonVariant: "error" | "primary" | "neutral" = "error";

  if (variant === "warning") {
    IconComponent = icon || RiAlertFill;
    iconContainerClass = "bg-warning-lighter";
    iconClass = "text-warning-base";
    buttonVariant = "primary";
  } else if (variant === "info") {
    IconComponent = icon || RiAlertFill;
    iconContainerClass = "bg-information-lighter";
    iconClass = "text-information-base";
    buttonVariant = "primary";
  }

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Modal.Root onOpenChange={onOpenChange} open={open}>
      <Modal.Content className="max-w-[440px]" showClose={showClose}>
        <Modal.Body>
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full",
                iconContainerClass,
              )}
            >
              <IconComponent className={cn("size-6", iconClass)} />
            </div>

            <div>
              <DialogPrimitives.Title className="text-label-md text-text-strong-950">
                {title}
              </DialogPrimitives.Title>
              <DialogPrimitives.Description className="mt-1 text-paragraph-sm text-text-sub-600">
                {description}
              </DialogPrimitives.Description>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              className="w-full"
              disabled={isLoading}
              mode="stroke"
              size="small"
              variant="neutral"
            >
              {cancelText}
            </Button.Root>
          </Modal.Close>
          <Button.Root
            className="w-full"
            disabled={isLoading}
            onClick={handleConfirm}
            size="small"
            variant={buttonVariant}
          >
            {isLoading && <StaggeredFadeLoader variant="muted" />}
            {isLoading ? "Loading..." : confirmText}
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
