"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@repo/ui/utils/cn";

interface StudioButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
}

export default function StudioButton({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: StudioButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition duration-150 active:scale-97",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-studio-accent",
        "disabled:pointer-events-none disabled:text-studio-faint",
        size === "sm" ? "h-7 px-2.5 text-st-sm" : "h-9 px-3.5 text-sm",
        variant === "primary" &&
          "bg-studio-accent text-studio-accent-ink hover:bg-studio-accent-strong disabled:bg-studio-raised",
        variant === "secondary" &&
          "bg-studio-raised text-studio-text shadow-st-ring hover:bg-studio-hover",
        variant === "ghost" &&
          "text-studio-muted hover:bg-studio-raised hover:text-studio-text",
        className,
      )}
    />
  );
}
