"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiErrorWarningLine } from "@repo/ui/icon";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormPassword } from "@repo/ui/form";
import { StaggeredFadeLoader } from "@repo/ui/custom/staggered-fade-loader";
import * as Button from "@repo/ui/button";
import { FormMessage } from "@repo/ui/form";
import * as Modal from "@repo/ui/modal";

const passwordSchema = z.object({
  password: z.string().min(1, { error: "Password is required" }),
});

export type PasswordStepData = z.infer<typeof passwordSchema>;

interface PasswordStepProps {
  onSubmit: (data: PasswordStepData) => void;
  onCancel: () => void;
  error: string | null;
  isSubmitting: boolean;
}

export function PasswordStep({
  onSubmit,
  onCancel,
  error,
  isSubmitting,
}: PasswordStepProps) {
  const form = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
    },
  });

  const { control, handleSubmit, formState } = form;

  return (
    <>
      <Modal.Body className="space-y-6">
        <div className="w-full">
          <form
            className="space-y-4"
            id="password-form"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-1">
              <FormPassword
                control={control}
                label="Password"
                name="password"
                placeholder="Enter your password"
                required
              />
              {error && !formState.errors.password && (
                <FormMessage
                  className="mt-1"
                  Icon={RiErrorWarningLine}
                  variant="error"
                >
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
          mode="stroke"
          onClick={onCancel}
          size="small"
          type="button"
          variant="neutral"
        >
          Cancel
        </Button.Root>
        <Button.Root
          className="w-full"
          disabled={isSubmitting}
          form="password-form"
          size="small"
          type="submit"
          variant="primary"
        >
          {isSubmitting && <StaggeredFadeLoader variant="muted" />}
          {isSubmitting ? "Verifying..." : "Continue"}
        </Button.Root>
      </Modal.Footer>
    </>
  );
}
