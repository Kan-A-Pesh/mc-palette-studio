"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiErrorWarningLine, RiShieldKeyholeLine } from "@repo/ui/icon";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormPassword } from "@repo/ui/form";
import { StaggeredFadeLoader } from "@repo/ui/custom/staggered-fade-loader";
import * as Alert from "@repo/ui/alert";
import * as Button from "@repo/ui/button";
import { FormMessage } from "@repo/ui/form";
import * as Modal from "@repo/ui/modal";
import type { ControlledDialogProps } from "@repo/ui/controlled-dialog-props";
import { AUTH_ERRORS } from "@/constants/auth-errors";
import { authClient } from "@/lib/auth/auth-client";

const disableSchema = z.object({
  password: z.string().min(1, { error: "Password is required" }),
});

export type DisableAuthenticatorData = z.infer<typeof disableSchema>;

interface DisableAuthenticatorDialogProps extends ControlledDialogProps {
  onComplete: () => void;
}

export function DisableAuthenticatorDialog({
  open,
  onOpenChange,
  onComplete,
}: DisableAuthenticatorDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(disableSchema),
    defaultValues: {
      password: "",
    },
  });

  const { control, handleSubmit } = form;

  const onSubmit = async (data: DisableAuthenticatorData) => {
    try {
      setError(null);
      setIsSubmitting(true);

      // Call the API to disable 2FA
      const response = await authClient.twoFactor.disable({
        password: data.password,
      });

      if (response?.error) {
        if (
          response.error.code === AUTH_ERRORS.INVALID_PASSWORD ||
          response.error.code === AUTH_ERRORS.VALIDATION_ERROR
        ) {
          setError("The password you entered is incorrect. Please try again.");
        } else {
          setError(
            response.error.message || "Something went wrong. Please try again.",
          );
        }
        return;
      }

      // If successful, close the dialog and notify the parent
      onComplete();
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Modal.Root onOpenChange={onOpenChange} open={open}>
      <Modal.Content>
        <Modal.Header
          description="Enter your password to disable 2FA"
          icon={RiShieldKeyholeLine}
          title="Disable Two-Factor Authentication"
        />

        <Modal.Body className="space-y-6">
          <Alert.Root status="error" variant="light">
            <Alert.Icon as={RiErrorWarningLine} />
            <div>
              <div className="text-label-sm">Security Warning</div>
              <p className="text-paragraph-xs text-text-sub-600">
                Disabling two-factor authentication will significantly reduce
                the security of your account. Only proceed if you&apos;re
                absolutely sure.
              </p>
            </div>
          </Alert.Root>

          <div className="w-full">
            <form
              className="space-y-4"
              id="disable-2fa-form"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="space-y-2">
                <FormPassword
                  control={control}
                  label="Confirm Password"
                  name="password"
                  placeholder="Enter your password"
                  required
                />
                {error && (
                  <FormMessage Icon={RiErrorWarningLine} variant="error">
                    {error}
                  </FormMessage>
                )}
              </div>
            </form>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button.Root
            className="w-full"
            disabled={isSubmitting}
            mode="stroke"
            onClick={handleCancel}
            size="small"
            type="button"
            variant="neutral"
          >
            Cancel
          </Button.Root>
          <Button.Root
            className="w-full"
            disabled={isSubmitting}
            form="disable-2fa-form"
            size="small"
            type="submit"
            variant="error"
          >
            {isSubmitting && <StaggeredFadeLoader variant="muted" />}
            {isSubmitting ? "Disabling..." : "Disable Two-Factor"}
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
