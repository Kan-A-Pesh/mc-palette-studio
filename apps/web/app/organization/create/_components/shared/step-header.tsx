import { cn } from "@repo/ui/utils/cn";

interface StepHeaderProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export function StepHeader({
  icon: Icon,
  title,
  description,
}: StepHeaderProps) {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div
        className={cn(
          "relative flex size-17 shrink-0 items-center justify-center rounded-full backdrop-blur-xl lg:size-24",
          // bg
          "before:absolute before:inset-0 before:rounded-full",
          "before:bg-gradient-to-b before:from-neutral-500 before:to-transparent before:opacity-10",
          // stroke
          "after:absolute after:inset-0 after:rounded-full",
          "after:bg-gradient-to-b after:from-neutral-500 after:to-transparent after:opacity-16",
          "after:mask-exclude after:p-px",
        )}
      >
        <div className="relative z-10 flex size-12 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset lg:size-16">
          <Icon className="size-6 text-text-sub-600 lg:size-8" />
        </div>
      </div>

      <div className="space-y-1 text-center">
        <div className="text-title-h6 lg:text-title-h5">{title}</div>
        <div className="text-paragraph-sm text-text-sub-600 lg:text-paragraph-md">
          {description}
        </div>
      </div>
    </div>
  );
}
