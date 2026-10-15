"use client";

import { RiCheckLine } from "@remixicon/react";

import { StaggeredFadeLoader } from "@/ui/custom/staggered-fade-loader";
import * as Button from "@/ui/button";

interface SaveButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isDirty: boolean;
  isPending: boolean;
}

export function SaveButton({
  isDirty,
  isPending,
  onClick,
  ...props
}: SaveButtonProps) {
  return (
    <Button.Root
      disabled={!isDirty || isPending}
      onClick={onClick}
      type="button"
      {...props}
    >
      {isPending ? (
        <>
          <StaggeredFadeLoader
            className="flex size-5 shrink-0 items-center justify-center"
            variant="muted"
          />
          Saving...
        </>
      ) : (
        (() => {
          if (isDirty) {
            return "Apply Changes";
          }
          return (
            <>
              <Button.Icon as={RiCheckLine} className="size-5" />
              Saved
            </>
          );
        })()
      )}
    </Button.Root>
  );
}
