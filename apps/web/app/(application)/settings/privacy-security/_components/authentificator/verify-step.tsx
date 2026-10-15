"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  RiCheckboxCircleFill,
  RiFileCopyLine,
  RiQuestionLine,
} from "@repo/ui/icon";
import { useState } from "react";
import { useForm } from "react-hook-form";
import QRCode from "react-qr-code";
import type { z } from "zod";

import { StaggeredFadeLoader } from "@repo/ui/custom/staggered-fade-loader";
import * as Accordion from "@repo/ui/accordion";
import * as Button from "@repo/ui/button";
import * as Divider from "@repo/ui/divider";
import { FormMessage } from "@repo/ui/form";
import * as Input from "@repo/ui/input";
import * as Label from "@repo/ui/label";
import * as Modal from "@repo/ui/modal";
import { cn } from "@repo/ui/utils/cn";
import { verifyTOTPSchema } from "./validator";

export type VerifyStepData = z.infer<typeof verifyTOTPSchema>;

interface VerifyStepProps {
  onSubmit: (data: VerifyStepData) => void;
  onCancel: () => void;
  error: string | null;
  isSubmitting: boolean;
  totpURI: string;
  secretKey: string | null;
}

export function VerifyStep({
  onSubmit,
  onCancel,
  error,
  isSubmitting,
  totpURI,
  secretKey,
}: VerifyStepProps) {
  const [isCopied, setIsCopied] = useState(false);
  const form = useForm({
    resolver: zodResolver(verifyTOTPSchema),
    defaultValues: {
      code: "",
    },
  });

  const handleCopy = () => {
    if (secretKey) {
      navigator.clipboard.writeText(secretKey);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <>
      <Modal.Body className="space-y-6">
        <div className="flex w-full flex-col items-center gap-4">
          <p className="text-center text-paragraph-sm text-text-sub-600">
            Scan this QR code with your authenticator app to enable two-factor
            authentication
          </p>

          <div className="rounded-md border border-stroke-soft-200 bg-white p-4">
            <QRCode size={180} value={totpURI} />
          </div>

          {secretKey && (
            <Accordion.Root className="w-full" collapsible type="single">
              <Accordion.Item value="manual-key">
                <Accordion.Header>
                  <Accordion.Trigger className="text-primary-600">
                    <Accordion.Icon as={RiQuestionLine} />
                    Can&apos;t scan the QR code?
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content>
                  <div className="space-y-1.5 px-1 py-1">
                    <Label.Root
                      className="text-paragraph-xs text-text-sub-600"
                      htmlFor="secret-key"
                    >
                      Enter this key manually in your authenticator app
                    </Label.Root>
                    <Input.Root size="small">
                      <Input.Wrapper>
                        <Input.Input
                          className="font-mono text-text-disabled-300"
                          id="secret-key"
                          readOnly
                          value={secretKey}
                        />
                      </Input.Wrapper>
                      <button
                        aria-label={isCopied ? "Copied" : "Copy"}
                        className={cn(
                          "inline-flex h-9 items-center justify-center gap-2 rounded-none bg-bg-weak-50 px-2.5 text-label-sm outline-none ring-1 ring-transparent ring-inset transition duration-200 ease-out",
                          isCopied
                            ? "text-success-600 hover:text-success-700"
                            : "text-text-sub-600 hover:bg-bg-weak-100 hover:text-text-strong-950",
                          "focus-visible:bg-bg-weak-100 focus-visible:text-text-strong-950 focus-visible:ring-transparent",
                        )}
                        onClick={handleCopy}
                        type="button"
                      >
                        {isCopied ? (
                          <RiCheckboxCircleFill className="size-4 shrink-0 text-success-base" />
                        ) : (
                          <RiFileCopyLine className="size-4 shrink-0" />
                        )}
                      </button>
                    </Input.Root>
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            </Accordion.Root>
          )}

          <Divider.Root variant="dotted-line" />

          <form
            className="w-full space-y-4"
            id="verify-form"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="space-y-2">
              <Label.Root htmlFor="code">
                Verification <Label.Asterisk />
              </Label.Root>
              <Input.Root
                hasError={!!form.formState.errors.code || !!error}
                id="code"
              >
                <Input.Wrapper>
                  <Input.Input
                    autoComplete="one-time-code"
                    autoFocus
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    type="text"
                    {...form.register("code")}
                  />
                </Input.Wrapper>
              </Input.Root>
              {form.formState.errors.code && (
                <FormMessage>{form.formState.errors.code.message}</FormMessage>
              )}
              {error && !form.formState.errors.code && (
                <FormMessage>{error}</FormMessage>
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
          form="verify-form"
          size="small"
          type="submit"
          variant="primary"
        >
          {isSubmitting && <StaggeredFadeLoader variant="muted" />}
          {isSubmitting ? "Verifying..." : "Verify"}
        </Button.Root>
      </Modal.Footer>
    </>
  );
}
