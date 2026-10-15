"use client";

import { RiCloseLine } from "@remixicon/react";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import * as Button from "@/ui/button";
import * as Tooltip from "@/ui/tooltip";
import { cn } from "@/utils/cn";

interface IslandDeselectProps extends ComponentPropsWithoutRef<"button"> {
  /**
   * Callback function to handle deselect all action
   */
  onDeselect: () => void;
  /**
   * Optional tooltip text
   * @default "Deselect all"
   */
  tooltipText?: string;
}

const IslandDeselect = forwardRef<HTMLButtonElement, IslandDeselectProps>(
  ({ className, onDeselect, tooltipText = "Deselect all", ...props }, ref) => {
    return (
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Button.Root
            className={cn(className)}
            mode="ghost"
            onClick={onDeselect}
            ref={ref}
            size="xsmall"
            variant="neutral"
            {...props}
          >
            <Button.Icon as={RiCloseLine} />
          </Button.Root>
        </Tooltip.Trigger>
        <Tooltip.Content>{tooltipText}</Tooltip.Content>
      </Tooltip.Root>
    );
  },
);

IslandDeselect.displayName = "IslandDeselect";

export { IslandDeselect };
