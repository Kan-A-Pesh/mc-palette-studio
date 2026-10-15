"use client";

import { RiInformationFill, RiShieldKeyholeLine } from "@repo/ui/icon";
import { useState } from "react";

import { AuthenticatorModal } from "@/app/(application)/settings/privacy-security/_components/authentificator/authenticator-modal";
import * as Alert from "@repo/ui/alert";
import { CursorLoader } from "@repo/ui/cursor-loader";
import * as Divider from "@repo/ui/divider";
import * as LabelPrimitives from "@repo/ui/label";
import * as Switch from "@repo/ui/switch";
import { useUserData } from "@/hooks/use-user-data";

import { DisableAuthenticatorDialog } from "./authentificator/disable-authenticator-dialog";
import Passkey from "./passkeys/passkey-section";

export default function TwoFactorSecurity() {
  const { user, isLoading, refetch } = useUserData();
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);

  if (isLoading || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <CursorLoader />
      </div>
    );
  }

  const isAuthenticatorSetup = user?.twoFactorEnabled ?? false;

  const handleToggleAuthenticator = () => {
    if (isAuthenticatorSetup) {
      setShowDisableModal(true);
    } else {
      setShowSetupModal(true);
    }
  };

  const handleDisableComplete = () => {
    refetch();
  };

  const handleSetupComplete = () => {
    refetch();
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div>
        <div className="text-label-md">2FA Security</div>
        <p className="mt-1 text-paragraph-sm text-text-sub-600">
          Enable two-factor authentication to your account.
        </p>
      </div>

      <Divider.Root variant="line-spacing" />

      <div className="space-y-8">
        <div className="flex flex-col gap-2">
          <LabelPrimitives.Root>Two-Factor Authentication</LabelPrimitives.Root>
          <LabelPrimitives.Root className="flex cursor-pointer items-center gap-3.5 rounded-xl bg-bg-white-0 p-4 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset transition duration-200 ease-out hover:bg-bg-weak-50 hover:ring-transparent has-[[data-state=checked]]:ring-primary-base">
            <div className="flex size-10 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset">
              <RiShieldKeyholeLine className="size-5 text-primary-600" />
            </div>

            <div className="flex-1">
              <div className="text-label-sm text-text-strong-950">
                Authenticator App
              </div>
              <div className="mt-1 text-paragraph-xs text-text-sub-600">
                {isAuthenticatorSetup
                  ? "Your account is protected with an authenticator app."
                  : "Add an extra layer of security with an authenticator app."}
              </div>
            </div>

            <Switch.Root
              checked={isAuthenticatorSetup}
              onCheckedChange={handleToggleAuthenticator}
            />
          </LabelPrimitives.Root>

          <Alert.Root
            className="mt-2"
            size="xsmall"
            status="information"
            variant="lighter"
          >
            <Alert.Icon as={RiInformationFill} />
            Two-factor authentication adds an extra layer of security by
            requiring a second verification step.
          </Alert.Root>
        </div>

        <div className="space-y-2">
          <LabelPrimitives.Root>Passkeys</LabelPrimitives.Root>

          <Passkey />
        </div>
      </div>

      {/* Disable 2FA Dialog */}
      <DisableAuthenticatorDialog
        onComplete={handleDisableComplete}
        onOpenChange={setShowDisableModal}
        open={showDisableModal}
      />

      {/* Setup 2FA Modal */}
      <AuthenticatorModal
        onComplete={handleSetupComplete}
        onOpenChange={setShowSetupModal}
        open={showSetupModal}
      />
    </div>
  );
}
