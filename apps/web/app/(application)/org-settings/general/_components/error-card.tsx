"use client";

import { RiErrorWarningLine } from "@repo/ui/icon";
import * as Button from "@repo/ui/button";

interface ErrorCardProps {
  onReload: () => void;
}

export default function ErrorCard({ onReload }: ErrorCardProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-6 rounded-lg border border-error-light bg-error-lighter p-8">
      <div className="flex flex-col items-center gap-4">
        <RiErrorWarningLine className="size-12 text-error-base" />
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-error-dark text-label-lg">Organization Error</h3>
          <p className="text-error-base text-paragraph-md">
            Could not load your organization. Please try again later.
          </p>
        </div>
      </div>
      <Button.Root
        className="w-full max-w-50"
        mode="filled"
        onClick={onReload}
        size="xsmall"
        variant="error"
      >
        Reload Page
      </Button.Root>
    </div>
  );
}
