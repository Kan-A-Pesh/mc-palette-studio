import type { ReactNode } from "react";

interface SectionTitleProps {
  id?: string;
  children: ReactNode;
  aside?: ReactNode;
}

export default function SectionTitle({
  id,
  children,
  aside,
}: SectionTitleProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h2
        id={id}
        className="text-st-xs font-semibold uppercase tracking-st-label text-studio-faint"
      >
        {children}
      </h2>
      {aside}
    </div>
  );
}
