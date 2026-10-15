import { Slot, Slottable } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "@/utils/cn";
import type { PolymorphicComponentProps } from "@/utils/polymorphic";

type TopbarItemButtonProps = {
  hasNotification?: boolean;
  asChild?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const TopbarItemButton = React.forwardRef<
  HTMLButtonElement,
  TopbarItemButtonProps
>(
  (
    { children, asChild, hasNotification, className, ...rest },
    forwardedRef,
  ) => {
    const Component = asChild ? Slot : "button";

    return (
      <Component
        className={cn(
          // base
          "relative flex size-10 shrink-0 items-center justify-center rounded-10 text-text-sub-600 transition duration-200 ease-out",
          // hover
          "hover:bg-bg-weak-50",
          // open
          "data-[state=open]:bg-bg-weak-50 data-[state=open]:text-primary-base",
          className,
        )}
        ref={forwardedRef}
        {...rest}
      >
        <Slottable>{children}</Slottable>
        {hasNotification && (
          <div className="absolute top-2.5 right-2.5 size-2 rounded-full border-2 border-stroke-white-0 bg-error-base shadow-regular-xs" />
        )}
      </Component>
    );
  },
);
TopbarItemButton.displayName = "TopbarItemButton";

function TopbarItemButtonIcon<T extends React.ElementType>({
  as,
  ...rest
}: PolymorphicComponentProps<T, React.HTMLAttributes<HTMLDivElement>>) {
  const Component = as || "div";

  return <Component className="size-5" {...rest} />;
}
TopbarItemButtonIcon.displayName = "TopbarItemButtonIcon";

export { TopbarItemButtonIcon as Icon, TopbarItemButton as Root };
