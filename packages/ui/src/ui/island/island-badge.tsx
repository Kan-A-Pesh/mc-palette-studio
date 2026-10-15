import * as Badge from "@/ui/badge";

import { useIslandContext } from "./island";

export interface IslandBadgeProps {
  /**
   * The count to display (overrides the value from Island context)
   */
  count?: number;
  /**
   * Label to show next to the badge
   */
  label?: string;
}

export function IslandBadge({ count, label = "selected" }: IslandBadgeProps) {
  const context = useIslandContext();
  const displayCount = count ?? context.count;

  if (displayCount === undefined) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 pl-1">
      <Badge.Root
        className="min-w-[20px] text-center font-mono"
        color="blue"
        size="medium"
        variant="filled"
      >
        {displayCount}
      </Badge.Root>
      {label && (
        <span className="font-medium text-label-sm text-text-sub-600">
          {label}
        </span>
      )}
    </div>
  );
}

IslandBadge.displayName = "IslandBadge";
