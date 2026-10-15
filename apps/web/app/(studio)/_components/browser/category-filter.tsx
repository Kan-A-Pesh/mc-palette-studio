"use client";

import { CATEGORIES, type Category } from "@repo/palette-core";
import { cn } from "@repo/ui/utils/cn";
import { CATEGORY_LABELS } from "../../_lib/studio-constants";

interface CategoryFilterProps {
  value: Category | "all";
  onChange: (value: Category | "all") => void;
}

export default function CategoryFilter({
  value,
  onChange,
}: CategoryFilterProps) {
  return (
    <div
      className="flex flex-wrap gap-1.5"
      role="group"
      aria-label="Categories"
    >
      {(["all", ...CATEGORIES] as const).map((c) => (
        <button
          key={c}
          type="button"
          aria-pressed={value === c}
          onClick={() => onChange(c)}
          className={cn(
            "px-2.5 py-1 text-xs font-medium transition-colors duration-150",
            "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-studio-accent",
            value === c
              ? "bg-studio-text text-studio-canvas"
              : "bg-studio-raised text-studio-muted hover:text-studio-text",
          )}
        >
          {c === "all" ? "All" : CATEGORY_LABELS[c]}
        </button>
      ))}
    </div>
  );
}
