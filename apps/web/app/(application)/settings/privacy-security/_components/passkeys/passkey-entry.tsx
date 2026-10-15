"use client";

import { RiDeleteBinLine, RiDeviceLine, RiPencilLine } from "@repo/ui/icon";
import { DEVICE_ICON_MAPPINGS } from "./device-icon-mappings";
import type { CredentialDeviceType } from "@better-auth/passkey/client";
import { useCallback, useState } from "react";

import { ConfirmationDialog } from "@repo/ui/custom/confirmation-dialog";
import * as Button from "@repo/ui/button";
import { authClient } from "@/lib/auth/auth-client";

import TwoFactorCard from "./card";
import type { Passkey } from "./passkey-type";
import { RenamePasskeyDialog } from "./rename-dialog";

interface PasskeyEntryProps {
  passkey: Passkey;
  onRefresh: () => void;
}

export default function PasskeyEntry({
  passkey,
  onRefresh,
}: PasskeyEntryProps) {
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRename = useCallback(() => {
    setShowRenameDialog(true);
  }, []);

  const handleDelete = useCallback(async () => {
    try {
      setIsDeleting(true);
      await authClient.passkey.deletePasskey({ id: passkey.id });
      onRefresh();
    } catch {
      // Failed to delete passkey
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  }, [onRefresh, passkey.id]);

  const getDeviceIcon = (
    name: string | undefined,
    deviceType: CredentialDeviceType,
  ) => {
    if (!name) {
      return RiDeviceLine;
    }

    if (deviceType === "multiDevice") {
      return RiDeviceLine;
    }

    const lowercaseName = name.toLowerCase();

    for (const [browserName, IconComponent] of Object.entries(
      DEVICE_ICON_MAPPINGS.browsers,
    )) {
      if (lowercaseName.includes(browserName)) {
        return IconComponent;
      }
    }

    for (const deviceInfo of Object.values(DEVICE_ICON_MAPPINGS.devices)) {
      if (
        deviceInfo.keywords.some((keyword) => lowercaseName.includes(keyword))
      ) {
        return deviceInfo.icon;
      }
    }

    return RiDeviceLine;
  };

  const DeviceIcon = getDeviceIcon(passkey.name, passkey.deviceType);

  const formattedDate = new Date(passkey.createdAt).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );

  return (
    <>
      <TwoFactorCard>
        <div className="flex items-center justify-between gap-2 py-1">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary-50">
              <DeviceIcon className="size-5 text-primary-600" />
            </div>
            <div className="flex flex-col">
              <div className="text-label-sm text-text-strong-950">
                {passkey.name}
              </div>
              <div className="text-paragraph-xs text-text-sub-600">
                Added on {formattedDate}
              </div>
            </div>
          </div>

          <div className="flex gap-1">
            <Button.Root
              mode="lighter"
              onClick={handleRename}
              size="xxsmall"
              title="Rename"
              variant="neutral"
            >
              <RiPencilLine className="size-4" />
            </Button.Root>
            <Button.Root
              mode="lighter"
              onClick={() => setShowDeleteDialog(true)}
              size="xxsmall"
              title="Delete"
              variant="error"
            >
              <RiDeleteBinLine className="size-4" />
            </Button.Root>
          </div>
        </div>
      </TwoFactorCard>

      {/* Rename Dialog */}
      <RenamePasskeyDialog
        onComplete={onRefresh}
        onOpenChange={setShowRenameDialog}
        open={showRenameDialog}
        passkey={passkey}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        confirmText="Delete Passkey"
        description={`Are you sure you want to delete the passkey "${passkey.name || "Unnamed"}"?\n\nYou will need to register it again to use it.`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onOpenChange={setShowDeleteDialog}
        open={showDeleteDialog}
        title="Delete Passkey"
        variant="danger"
      />
    </>
  );
}
