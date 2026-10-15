"use client";

import { RiFilterOffLine } from "@remixicon/react";
import { memo } from "react";

import * as Button from "@/ui/button";

interface ClearFiltersButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export const ClearFiltersButton = memo(
  ({ onClick, disabled }: ClearFiltersButtonProps) => {
    if (disabled) {
      return null;
    }

    return (
      <Button.Root
        disabled={disabled}
        mode="ghost"
        onClick={onClick}
        variant="neutral"
      >
        <Button.Icon as={RiFilterOffLine} />
        Clear Filters
      </Button.Root>
    );
  },
  (prevProps, nextProps) =>
    prevProps.disabled === nextProps.disabled &&
    prevProps.onClick === nextProps.onClick,
);

ClearFiltersButton.displayName = "ClearFiltersButton";
