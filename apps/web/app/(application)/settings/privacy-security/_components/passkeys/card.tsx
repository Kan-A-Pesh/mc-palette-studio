import { cn } from "@repo/ui/utils/cn";

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export default function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-bg-white-0 p-2.5 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset",
        className,
      )}
    >
      {children}
    </div>
  );
}
