import { VerticalDivider } from "@/ui/custom/vertical-divider";
import { cn } from "@/utils/cn";

export interface IslandDividerProps {
  /**
   * Optional custom className
   */
  className?: string;
}

export function IslandDivider({ className }: IslandDividerProps) {
  return <VerticalDivider className={cn("h-5", className)} />;
}

IslandDivider.displayName = "IslandDivider";
