"use client";

import {
  RiAdminLine,
  RiArrowRightSLine,
  RiHeadphoneLine,
  RiSettings2Line,
} from "@repo/ui/icon";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { PAGES } from "@/constants/pages";
import { useUserData } from "@/hooks/use-user-data";
import { cn } from "@repo/ui/utils/cn";
import { PROJECT } from "@repo/env/constants";

export function SettingsAndSupport({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const { user } = useUserData();

  const isActive = (prefix: string) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`);

  const links = [
    {
      id: "org-settings",
      href: PAGES.APPLICATION.ORG_SETTINGS.GENERAL,
      current: isActive("/org-settings"),
      icon: RiSettings2Line,
      label: "Organization settings",
    },
    {
      id: "support",
      href: `mailto:${PROJECT.HELP_EMAIL}`,
      icon: RiHeadphoneLine,
      label: "Support",
      disabled: true,
    },
    {
      id: "admin",
      href: PAGES.ADMIN.USERS,
      current: isActive("/admin"),
      icon: RiAdminLine,
      label: "Admin",
      role: "admin",
    },
  ];

  return (
    <div className="mt-auto space-y-2">
      <div
        className={cn("p-1 text-subheading-xs text-text-soft-400 uppercase", {
          "-mx-2.5 w-14 px-0 text-center": collapsed,
        })}
      >
        Others
      </div>
      <div className="space-y-1.5">
        {links
          .filter((link) => {
            if (link.role && user?.role !== link.role) {
              return false;
            }
            return true;
          })
          .map(({ id, href, icon: Icon, label, disabled, current }) => {
            return (
              <Link
                aria-current={current ? "page" : undefined}
                aria-disabled={disabled}
                className={cn(
                  "group relative flex items-center gap-2 whitespace-nowrap rounded-lg py-2 text-label-sm text-text-sub-600 transition duration-200 ease-out hover:bg-bg-weak-50",
                  "aria-[current=page]:bg-bg-weak-50",
                  "aria-[disabled]:pointer-events-none aria-[disabled]:opacity-50",
                  {
                    "w-9 px-2": collapsed,
                    "w-full px-3": !collapsed,
                  },
                )}
                href={href}
                key={id}
                onClick={
                  disabled ? (event) => event.preventDefault() : undefined
                }
                tabIndex={disabled ? -1 : undefined}
              >
                <div
                  className={cn(
                    "-translate-y-1/2 absolute top-1/2 h-5 w-1 origin-left rounded-r-full bg-primary-base transition duration-200 ease-out",
                    {
                      "-left-nav-indent": collapsed,
                      "-left-5": !collapsed,
                      "scale-100": current,
                      "scale-0": !current,
                    },
                  )}
                />
                <Icon
                  className={cn(
                    "size-5 shrink-0",
                    "group-aria-[current=page]:text-primary-base",
                  )}
                />
                <div
                  className="flex w-45 shrink-0 items-center gap-2"
                  data-hide-collapsed
                >
                  <span className="flex-1">{label}</span>
                  {current && (
                    <RiArrowRightSLine className="size-5 text-text-sub-600" />
                  )}
                </div>
              </Link>
            );
          })}
      </div>
    </div>
  );
}
