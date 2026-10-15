"use client";

import { cn } from "@repo/ui/utils/cn";

import { NavigationMenu } from "./sidebar/navigation-menu";
import { SettingsAndSupport } from "./sidebar/settings-and-support";
import { SidebarDivider } from "./sidebar/sidebar-divider";
import { SidebarHeader } from "./sidebar/sidebar-header";
import { useCollapsedState } from "./sidebar/use-collapsed-state";
import { UserProfile } from "./sidebar/user-profile";

interface SidebarProps {
  showBanner?: boolean;
}

export default function Sidebar({ showBanner = false }: SidebarProps) {
  const { collapsed, sidebarRef } = useCollapsedState();

  return (
    <>
      <div
        className={cn(
          "fixed top-0 left-0 z-40 hidden h-full overflow-hidden border-stroke-soft-200 border-r bg-bg-white-0 transition-all duration-300 ease-out lg:block",
          {
            "w-20": collapsed,
            "w-68": !collapsed,
            "pt-11": showBanner,
          },
        )}
      >
        <div
          className="flex h-full w-68 min-w-68 flex-col overflow-auto"
          ref={sidebarRef}
        >
          <SidebarHeader collapsed={collapsed} />

          <SidebarDivider collapsed={collapsed} />

          <div
            className={cn("flex flex-1 flex-col gap-5 pt-5 pb-4", {
              "px-nav-indent": collapsed,
              "px-5": !collapsed,
            })}
          >
            <NavigationMenu collapsed={collapsed} />
            <SettingsAndSupport collapsed={collapsed} />
          </div>

          <SidebarDivider collapsed={collapsed} />

          <UserProfile collapsed={collapsed} />
        </div>
      </div>

      {/* a necessary placeholder because of sidebar is fixed */}
      <div
        className={cn("shrink-0", {
          "w-68": !collapsed,
          "w-20": collapsed,
        })}
      />
    </>
  );
}
