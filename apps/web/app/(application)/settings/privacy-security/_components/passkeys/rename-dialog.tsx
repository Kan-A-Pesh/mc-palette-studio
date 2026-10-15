"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiErrorWarningLine, RiPencilLine } from "@repo/ui/icon";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormInput } from "@repo/ui/form";
import { StaggeredFadeLoader } from "@repo/ui/custom/staggered-fade-loader";
import * as Button from "@repo/ui/button";
import * as Form from "@repo/ui/form";
import * as Modal from "@repo/ui/modal";
import type { ControlledDialogProps } from "@repo/ui/controlled-dialog-props";
import { authClient } from "@/lib/auth/auth-client";

import type { Passkey } from "./passkey-type";

const renameSchema = z.object({
  name: z.string().min(1, { error: "Name is required" }),
});

type RenameFormData = z.infer<typeof renameSchema>;

interface RenamePasskeyDialogProps extends ControlledDialogProps {
  passkey: Passkey;
  onComplete: () => void;
}

export function RenamePasskeyDialog({
  passkey,
  open,
  onOpenChange,
  onComplete,
}: RenamePasskeyDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<RenameFormData>({
    resolver: zodResolver(renameSchema),
    defaultValues: {
      name: passkey.name,
    },
  });

  const { control, handleSubmit, reset } = form;

  React.useEffect(() => {
    if (!open) {
      return;
    }

    reset({ name: passkey.name });
    setError(null);
  }, [open, passkey.name, reset]);

  const onSubmit = async (data: RenameFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      await authClient.passkey.updatePasskey({
        id: passkey.id,
        name: data.name.trim(),
      });

      onComplete();
      onOpenChange(false);
    } catch {
      setError("Failed to rename passkey");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal.Root onOpenChange={onOpenChange} open={open}>
      <Modal.Content>
        <Modal.Header
          description="Update the name of your passkey."
          icon={RiPencilLine}
          title="Rename Passkey"
        />

        <form id="rename-form" onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <FormInput
                control={control}
                label="Passkey Name"
                name="name"
                placeholder="Enter passkey name"
                required
                tooltip="This name helps you identify your passkey across your devices."
              />
              {error && (
                <Form.FormMessage Icon={RiErrorWarningLine} variant="error">
                  {error}
                </Form.FormMessage>
              )}
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Modal.Close asChild>
              <Button.Root
                className="w-full"
                disabled={isSubmitting}
                mode="stroke"
                size="small"
                type="button"
                variant="neutral"
              >
                Cancel
              </Button.Root>
            </Modal.Close>
            <Button.Root
              className="w-full"
              disabled={isSubmitting}
              size="small"
              type="submit"
              variant="primary"
            >
              {isSubmitting && <StaggeredFadeLoader variant="muted" />}
              {isSubmitting ? "Saving..." : "Save"}
            </Button.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
