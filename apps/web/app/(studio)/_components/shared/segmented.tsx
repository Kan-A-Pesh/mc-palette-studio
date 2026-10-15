"use client";

import type { ReactNode } from "react";
import { cn } from "@repo/ui/utils/cn";

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: ReactNode; title?: string }[];
  onChange: (value: T) => void;
  className?: string;
}

/** A radio group drawn as a segmented control. */
export default function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "inline-flex rounded-lg bg-studio-canvas p-0.5 ring-1 ring-studio-line",
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            title={option.title}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-st-md font-medium transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-studio-accent",
              selected
                ? "bg-studio-raised text-studio-text shadow-st-ring"
                : "text-studio-muted hover:text-studio-text",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
