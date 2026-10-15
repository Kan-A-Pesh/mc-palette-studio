"use client";

import { MAX_TILE_SIZE } from "@repo/palette-core";

interface SizeStepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export default function SizeStepper({
  label,
  value,
  onChange,
}: SizeStepperProps) {
  const step =
    "grid size-6 place-items-center rounded-md text-studio-muted hover:bg-studio-raised hover:text-studio-text disabled:text-studio-line-strong focus-visible:outline-2 focus-visible:outline-studio-accent";
  return (
    <div className="flex items-center justify-between rounded-lg bg-studio-canvas px-2 py-1 ring-1 ring-studio-line">
      <span className="text-xs text-studio-muted">{label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={`${label} −1`}
          disabled={value <= 1}
          onClick={() => onChange(value - 1)}
          className={step}
        >
          −
        </button>
        <span className="w-4 text-center text-sm tabular-nums text-studio-text">
          {value}
        </span>
        <button
          type="button"
          aria-label={`${label} +1`}
          disabled={value >= MAX_TILE_SIZE}
          onClick={() => onChange(value + 1)}
          className={step}
        >
          +
        </button>
      </div>
    </div>
  );
}
