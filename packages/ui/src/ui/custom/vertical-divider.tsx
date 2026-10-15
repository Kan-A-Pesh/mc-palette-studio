import { cn } from "@/utils/cn";

export function VerticalDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative w-0 before:absolute before:top-0 before:left-0 before:h-full before:w-px before:bg-stroke-soft-200",
        className,
      )}
    />
  );
}
