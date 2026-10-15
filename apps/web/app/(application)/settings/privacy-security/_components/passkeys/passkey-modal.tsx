"use client";

import {
  RiErrorWarningFill,
  RiInformationFill,
  RiKey2Fill,
} from "@repo/ui/icon";
import { useEffect, useState } from "react";

import { StaggeredFadeLoader } from "@repo/ui/custom/staggered-fade-loader";
import * as Alert from "@repo/ui/alert";
import * as Button from "@repo/ui/button";
import { FormGlobalMessage } from "@repo/ui/form";
import * as Input from "@repo/ui/input";
import * as Label from "@repo/ui/label";
import * as Modal from "@repo/ui/modal";
import type { ControlledDialogProps } from "@repo/ui/controlled-dialog-props";
import { authClient } from "@/lib/auth/auth-client";

// Function to detect browser and OS
function getDefaultPasskeyName(): string {
  if (typeof window === "undefined") {
    return "My Passkey";
  }

  // Browser detection
  const userAgent = navigator.userAgent;
  let browserName = "Browser";

  if (userAgent.indexOf("Chrome") > -1) {
    browserName = "Chrome";
  } else if (userAgent.indexOf("Safari") > -1) {
    browserName = "Safari";
  } else if (userAgent.indexOf("Firefox") > -1) {
    browserName = "Firefox";
  } else if (userAgent.indexOf("Edge") > -1) {
    browserName = "Edge";
  } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
    browserName = "Opera";
  }

  // OS detection
  let osName = "Device";

  if (userAgent.indexOf("Win") > -1) {
    osName = "Windows";
  } else if (userAgent.indexOf("Mac") > -1) {
    osName = "Mac";
  } else if (userAgent.indexOf("Linux") > -1) {
    osName = "Linux";
  } else if (userAgent.indexOf("Android") > -1) {
    osName = "Android";
  } else if (
    userAgent.indexOf("iPhone") > -1 ||
    userAgent.indexOf("iPad") > -1
  ) {
    osName = "iOS";
  }

  return `${browserName} on ${osName}`;
}

interface PasskeyModalProps extends ControlledDialogProps {
  onComplete: () => void;
}

export function PasskeyModal({
  open,
  onOpenChange,
  onComplete,
}: PasskeyModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [passkeyName, setPasskeyName] = useState("My Passkey");

  // Set default passkey name when modal opens
  useEffect(() => {
    if (open) {
      setPasskeyName(getDefaultPasskeyName());
    }
  }, [open]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setIsProcessing(false);
      setErrorMessage(null);
    }
  }, [open]);

  const handleAddPasskey = async () => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);

      const res = await authClient.passkey.addPasskey({
        name: passkeyName,
      });

      if (res?.error) {
        if (res.error.status === 400) {
          if (res.error.message === "previously registered") {
            setErrorMessage("This passkey is already registered");
          } else {
            setErrorMessage("The operation has been cancelled or timed out");
          }
        } else {
          setErrorMessage("An error occurred");
        }
        return;
      }

      onComplete();
      onOpenChange(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "An error occurred",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal.Root onOpenChange={onOpenChange} open={open}>
      <Modal.Content>
        <Modal.Header
          description="A secure and easy way to log in to your account"
          icon={RiKey2Fill}
          title="Add a Passkey"
        />

        <Modal.Body className="space-y-6">
          <Alert.Root size="small" status="information" variant="lighter">
            <Alert.Icon as={RiInformationFill} />
            Passkeys use biometrics or your device to authenticate you, without
            the need for passwords.
          </Alert.Root>

          <div className="space-y-2">
            <Label.Root htmlFor="passkey-name">
              Passkey Name
              <Label.Asterisk />
            </Label.Root>
            <Input.Root id="passkey-name">
              <Input.Wrapper>
                <Input.Input
                  onChange={(e) => setPasskeyName(e.target.value)}
                  placeholder="Enter a name for your passkey"
                  required
                  type="text"
                  value={passkeyName}
                />
              </Input.Wrapper>
            </Input.Root>
            {errorMessage && (
              <FormGlobalMessage Icon={RiErrorWarningFill} variant="error">
                {errorMessage}
              </FormGlobalMessage>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              className="w-full"
              disabled={isProcessing}
              mode="stroke"
              size="small"
              variant="neutral"
            >
              Cancel
            </Button.Root>
          </Modal.Close>
          <Button.Root
            className="w-full"
            disabled={isProcessing}
            onClick={handleAddPasskey}
            size="small"
            variant="primary"
          >
            {isProcessing && <StaggeredFadeLoader variant="muted" />}
            {isProcessing ? "Processing..." : "Add Passkey"}
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
