import {
  RiCalendarLine,
  RiEqualizerLine,
  RiFileCloudLine,
  RiFoldersLine,
  RiGroupLine,
  RiLayoutGridLine,
  RiStarSmileLine,
} from "@repo/ui/icon";
import type * as React from "react";

export type NavigationLink = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  disabled?: boolean;
};

export function getNavigationLinks(): NavigationLink[] {
  return [
    {
      id: "dashboard",
      icon: RiLayoutGridLine,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      id: "calendar",
      icon: RiCalendarLine,
      label: "Calendar",
      href: "#",
      disabled: true,
    },
    {
      id: "projects",
      icon: RiFoldersLine,
      label: "Projects",
      href: "#",
      disabled: true,
    },
    {
      id: "teams",
      icon: RiGroupLine,
      label: "Teams",
      href: "#",
      disabled: true,
    },
    {
      id: "integrations",
      icon: RiEqualizerLine,
      label: "Integrations",
      href: "#",
      disabled: true,
    },
    {
      id: "benefits",
      icon: RiStarSmileLine,
      label: "Benefits",
      href: "#",
      disabled: true,
    },
    {
      id: "documents",
      icon: RiFileCloudLine,
      label: "Documents",
      href: "#",
      disabled: true,
    },
  ];
}
