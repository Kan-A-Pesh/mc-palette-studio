"use client";

import { cn } from "@repo/ui/utils/cn";

interface RangeProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
}

/** Native range input, filled up to its value; updates live while dragging. */
export default function Range({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  className,
}: RangeProps) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      aria-label={label}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn("studio-range w-full", className)}
      style={{ ["--fill" as string]: `${fill}%` }}
    />
  );
}
