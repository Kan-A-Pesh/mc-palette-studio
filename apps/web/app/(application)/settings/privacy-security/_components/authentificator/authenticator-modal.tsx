"use client";

import { RiKey2Fill, RiQrCodeLine, RiShieldKeyholeLine } from "@repo/ui/icon";
import { useEffect } from "react";

import * as Modal from "@repo/ui/modal";
import type { ControlledDialogProps } from "@repo/ui/controlled-dialog-props";
import { AUTH_ERRORS } from "@/constants/auth-errors";
import { authClient } from "@/lib/auth/auth-client";
import { useAuthenticatorStore } from "@/lib/stores/authenticator-store";

import { BackupStep } from "./backup-step";
import { PasswordStep, type PasswordStepData } from "./password-step";
import { VerifyStep, type VerifyStepData } from "./verify-step";

interface AuthenticatorModalProps extends ControlledDialogProps {
  onComplete: () => void;
}

interface TwoFactorError {
  code?: string;
  message?: string;
}

interface TwoFactorResponse {
  totpURI?: string;
  backupCodes?: string[];
}

export function AuthenticatorModal({
  open,
  onOpenChange,
  onComplete,
}: AuthenticatorModalProps) {
  // Zustand store for state management
  const {
    step,
    setStep,
    secretKey,
    setSecretKey,
    totpURI,
    setTotpURI,
    backupCodes,
    setBackupCodes,
    error,
    setError,
    isLoading,
    setIsLoading,
    reset,
  } = useAuthenticatorStore();

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  // Extract secret key from TOTP URI
  const extractSecretFromURI = (totpURIValue: string): string | null => {
    const secretPart = totpURIValue.split("secret=")[1];
    if (secretPart) {
      return secretPart.split("&")[0] ?? null;
    }
    return null;
  };

  // Handle API response errors
  const handleApiError = (responseError: TwoFactorError): boolean => {
    if (
      responseError.code === AUTH_ERRORS.VALIDATION_ERROR ||
      responseError.code === AUTH_ERRORS.INVALID_PASSWORD
    ) {
      setError("The password you entered is incorrect. Please try again.");
    } else {
      setError(
        responseError.message ||
          "Something went wrong while setting up two-factor authentication. Please try again.",
      );
    }
    setIsLoading(false);
    return false;
  };

  // Process successful 2FA setup response
  const processSuccessfulResponse = (
    responseData: TwoFactorResponse,
  ): boolean => {
    if (!responseData?.totpURI) {
      return false;
    }

    setTotpURI(responseData.totpURI);
    setBackupCodes(responseData.backupCodes || []);

    const secret = extractSecretFromURI(responseData.totpURI);
    if (secret) {
      setSecretKey(secret);
    }

    setStep("verify");
    return true;
  };

  // Handle password submission
  const handlePasswordSubmit = async (data: PasswordStepData) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await authClient.twoFactor.enable({
        password: data.password,
      });

      if (response.error) {
        return handleApiError(response.error);
      }

      processSuccessfulResponse(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to setup authenticator",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async (data: VerifyStepData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authClient.twoFactor.verifyTotp({
        code: data.code,
      });

      if (response.error) {
        setError("Invalid verification code");
        setIsLoading(false);
        return;
      }

      setStep("backup");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while setting up two-factor authentication. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    onComplete();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const getHeaderProps = () => {
    switch (step) {
      case "password":
        return {
          icon: RiShieldKeyholeLine,
          title: "Confirm Password",
          description: "Enter your password to enable 2FA",
        };
      case "verify":
        return {
          icon: RiQrCodeLine,
          title: "Setup Authenticator App",
          description: "Scan the QR code with your authenticator app",
        };
      case "backup":
        return {
          icon: RiKey2Fill,
          title: "Backup Codes",
          description: "Save these codes for account recovery",
        };
      default:
        return {
          icon: RiShieldKeyholeLine,
          title: "Confirm Password",
          description: "Enter your password to enable 2FA",
        };
    }
  };

  const { icon, title, description } = getHeaderProps();

  const renderCurrentStep = () => {
    switch (step) {
      case "password":
        return (
          <PasswordStep
            error={error}
            isSubmitting={isLoading}
            onCancel={handleCancel}
            onSubmit={handlePasswordSubmit}
          />
        );
      case "verify":
        return (
          totpURI && (
            <VerifyStep
              error={error}
              isSubmitting={isLoading}
              onCancel={handleCancel}
              onSubmit={handleVerifySubmit}
              secretKey={secretKey}
              totpURI={totpURI}
            />
          )
        );
      case "backup":
        return (
          <BackupStep backupCodes={backupCodes} onComplete={handleComplete} />
        );
      default:
        return null;
    }
  };

  return (
    <Modal.Root onOpenChange={onOpenChange} open={open}>
      <Modal.Content>
        <Modal.Header description={description} icon={icon} title={title} />

        {renderCurrentStep()}
      </Modal.Content>
    </Modal.Root>
  );
}
