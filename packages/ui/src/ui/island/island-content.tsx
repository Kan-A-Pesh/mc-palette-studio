import type * as React from "react";

import { cn } from "@/utils/cn";

export interface IslandContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Optional custom className
   */
  className?: string;
}

export function IslandContent({
  children,
  className,
  ...props
}: IslandContentProps) {
  return (
    <div
      className={cn("flex items-center gap-2 px-2.5 py-2.5", className)}
      {...props}
    >
      {children}
    </div>
  );
}

IslandContent.displayName = "IslandContent";
