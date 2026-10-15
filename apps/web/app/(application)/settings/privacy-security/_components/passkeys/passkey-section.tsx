"use client";

import {
  RiAddLine,
  RiErrorWarningLine,
  RiFingerprintLine,
} from "@repo/ui/icon";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import * as Button from "@repo/ui/button";
import { FormGlobalMessage } from "@repo/ui/form";
import { authClient } from "@/lib/auth/auth-client";

import PasskeyEntry from "./passkey-entry";
import { PasskeyModal } from "./passkey-modal";
import PasskeySkeleton from "./passkey-skeleton";

export default function PasskeySection() {
  const [modalOpen, setModalOpen] = useState(false);

  const {
    data: passkeys,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["passkeys"],
    queryFn: () => authClient.passkey.listUserPasskeys(),
  });

  const handleRefresh = useCallback(() => {
    if (!passkeys?.data) {
      return;
    }
    refetch();
  }, [passkeys, refetch]);

  const handleAddPasskey = useCallback(() => {
    setModalOpen(true);
  }, []);

  if (isLoading) {
    return <PasskeySkeleton />;
  }

  if (error || !passkeys || passkeys.error || !passkeys.data) {
    return (
      <FormGlobalMessage Icon={RiErrorWarningLine} variant="error">
        {error?.message || passkeys?.error?.message || "An error occurred"}
      </FormGlobalMessage>
    );
  }

  if (passkeys.data.length === 0) {
    return (
      <>
        <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-stroke-sub-300 border-dashed bg-bg-white-0 p-5 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary-50">
            <RiFingerprintLine className="size-5 text-primary-600" />
          </div>

          <div className="flex flex-col items-center gap-0.5">
            <h3 className="text-label-sm text-text-strong-950">
              No passkeys yet
            </h3>
            <p className="max-w-55 text-paragraph-xs text-text-sub-600">
              Passkeys provide a more secure way to sign in without passwords.
            </p>
          </div>

          <Button.Root
            className="mt-1"
            mode="stroke"
            onClick={handleAddPasskey}
            size="small"
            variant="neutral"
          >
            <Button.Icon as={RiAddLine} />
            Add a passkey
          </Button.Root>
        </div>

        <PasskeyModal
          onComplete={handleRefresh}
          onOpenChange={setModalOpen}
          open={modalOpen}
        />
      </>
    );
  }

  return (
    <section className="flex flex-col gap-2">
      {passkeys.data.map((passkey) => (
        <PasskeyEntry
          key={passkey.id + passkey.name}
          onRefresh={handleRefresh}
          passkey={passkey}
        />
      ))}

      <Button.Root mode="stroke" onClick={handleAddPasskey} size="small">
        <Button.Icon as={RiAddLine} />
        Add a passkey
      </Button.Root>

      <PasskeyModal
        onComplete={handleRefresh}
        onOpenChange={setModalOpen}
        open={modalOpen}
      />
    </section>
  );
}
