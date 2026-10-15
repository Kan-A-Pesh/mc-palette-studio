"use client";

import { RiArrowRightSLine } from "@repo/ui/icon";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@repo/ui/utils/cn";
import { getNavigationLinks } from "./navigation-links";

export function NavigationMenu({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const navigationLinks = getNavigationLinks();

  return (
    <div className="space-y-2">
      <div
        className={cn("p-1 text-subheading-xs text-text-soft-400 uppercase", {
          "-mx-2.5 w-14 px-0 text-center": collapsed,
        })}
      >
        Main
      </div>
      <div className="space-y-1">
        {navigationLinks.map(({ id, icon: Icon, label, href, disabled }) => (
          <Link
            aria-current={pathname === href ? "page" : undefined}
            aria-disabled={disabled}
            className={cn(
              "group relative flex items-center gap-2 whitespace-nowrap rounded-lg py-2 text-text-sub-600 hover:bg-bg-weak-50",
              "transition duration-200 ease-out",
              "aria-[current=page]:bg-bg-weak-50",
              "aria-[disabled]:pointer-events-none aria-[disabled]:opacity-50",
              {
                "w-9 px-2": collapsed,
                "w-full px-3": !collapsed,
              },
            )}
            href={href}
            key={id}
            onClick={disabled ? (event) => event.preventDefault() : undefined}
            tabIndex={disabled ? -1 : undefined}
          >
            <div
              className={cn(
                "-translate-y-1/2 absolute top-1/2 h-5 w-1 origin-left rounded-r-full bg-primary-base transition duration-200 ease-out",
                {
                  "-left-nav-indent": collapsed,
                  "-left-5": !collapsed,
                  "scale-100": pathname === href,
                  "scale-0": pathname !== href,
                },
              )}
            />
            <Icon
              className={cn(
                "size-5 shrink-0 text-text-sub-600 transition duration-200 ease-out",
                "group-aria-[current=page]:text-primary-base",
              )}
            />

            <div
              className="flex w-45 shrink-0 items-center gap-2"
              data-hide-collapsed
            >
              <div className="flex-1 text-label-sm">{label}</div>
              {pathname === href && (
                <RiArrowRightSLine className="size-5 text-text-sub-600" />
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
