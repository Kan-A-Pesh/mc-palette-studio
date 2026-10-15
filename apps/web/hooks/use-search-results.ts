"use client";

import { useMemo, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  type RemixiconComponentType,
  RiDashboardLine,
  RiSettingsLine,
  RiShieldLine,
  RiTeamLine,
  RiBuilding2Line,
  RiAdminLine,
  RiFileTextLine,
  RiChat1Line,
  RiHome2Line,
  RiLogoutBoxLine,
  RiContrastLine,
} from "@repo/ui/icon";
import { PAGES } from "@/constants/pages";
import { signOut } from "@/lib/auth/sign-out";

// ============================================================================
// TYPES
// ============================================================================

export interface SearchItem {
  id: string;
  label: string;
  description?: string;
  icon?: RemixiconComponentType;
  keywords?: string[];
  onSelect: () => void;
}

export interface SearchGroup {
  id: string;
  label: string;
  items: SearchItem[];
}

type ActionConfig = Omit<SearchItem, "onSelect"> & {
  handler: () => void | Promise<void>;
};

// ============================================================================
// CONFIGURATION
// ============================================================================

// Add pages here. Some pages may require role checks - integrate with your auth
// by filtering items in the search function based on user context.
// Example: filter admin pages by checking user.role === "admin"
const PAGES_CONFIG: Omit<SearchItem, "onSelect">[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: RiDashboardLine,
    keywords: ["home", "overview"],
    description: "View your dashboard",
  },
  {
    id: "account",
    label: "Account Settings",
    icon: RiSettingsLine,
    keywords: ["profile", "user"],
    description: "Manage your account",
  },
  {
    id: "security",
    label: "Privacy & Security",
    icon: RiShieldLine,
    keywords: ["password", "2fa"],
    description: "Security settings",
  },
  {
    id: "org-settings",
    label: "Organization Settings",
    icon: RiBuilding2Line,
    keywords: ["org", "team"],
    description: "Manage organization",
  },
  {
    id: "members",
    label: "Team Members",
    icon: RiTeamLine,
    keywords: ["users", "invite"],
    description: "Manage team members",
  },
  {
    id: "create-org",
    label: "Create Organization",
    icon: RiBuilding2Line,
    keywords: ["new org"],
    description: "Create a new organization",
  },
  {
    id: "invitations",
    label: "Invitations",
    icon: RiTeamLine,
    keywords: ["pending", "invites"],
    description: "View pending invitations",
  },
  {
    id: "admin",
    label: "Admin Panel",
    icon: RiAdminLine,
    keywords: ["admin", "management"],
    description: "Administration dashboard",
  },
  {
    id: "admin-users",
    label: "Admin Users",
    icon: RiAdminLine,
    keywords: ["admin", "all users"],
    description: "Manage all users",
  },
  {
    id: "documents",
    label: "Documents",
    icon: RiFileTextLine,
    keywords: ["docs", "files"],
    description: "Document editor example",
  },
  {
    id: "chat",
    label: "Chat",
    icon: RiChat1Line,
    keywords: ["messages"],
    description: "Chat example",
  },
  {
    id: "home",
    label: "Home",
    icon: RiHome2Line,
    keywords: ["landing"],
    description: "Go to home page",
  },
];

const PAGE_PATHS: Record<string, string> = {
  dashboard: PAGES.APPLICATION.DASHBOARD,
  account: PAGES.APPLICATION.SETTINGS.ACCOUNT,
  security: PAGES.APPLICATION.SETTINGS.PRIVACY_SECURITY,
  "org-settings": PAGES.APPLICATION.ORG_SETTINGS.GENERAL,
  members: PAGES.APPLICATION.ORG_SETTINGS.MEMBERS,
  "create-org": PAGES.ORGANIZATION.CREATE,
  invitations: PAGES.ORGANIZATION.INVITATIONS,
  admin: PAGES.ADMIN.HOME,
  "admin-users": PAGES.ADMIN.USERS,
  documents: PAGES.EXAMPLES.DOCUMENTS,
  chat: PAGES.EXAMPLES.CHAT,
  home: PAGES.MARKETING.HOME,
};

// ============================================================================
// THEME HELPERS
// ============================================================================

const THEME_ORDER = ["light", "dark", "system"] as const;
type Theme = (typeof THEME_ORDER)[number];

function getNextTheme(current: string | undefined): Theme {
  const normalizedCurrent = current ?? "system";
  const currentIndex = THEME_ORDER.indexOf(normalizedCurrent as Theme);
  const validIndex = currentIndex === -1 ? 2 : currentIndex;
  return THEME_ORDER[(validIndex + 1) % THEME_ORDER.length]!;
}

function formatThemeName(theme: string): string {
  return theme.charAt(0).toUpperCase() + theme.slice(1);
}

// ============================================================================
// SEARCH FUNCTION
// ============================================================================

function performSearch(
  query: string,
  navigate: (path: string) => void,
  actions: ActionConfig[],
): SearchGroup[] {
  const normalizedQuery = query.toLowerCase().trim();

  const matchesQuery = (item: Omit<SearchItem, "onSelect">) => {
    if (!normalizedQuery) return true;
    const text = [item.label, item.description, ...(item.keywords ?? [])]
      .join(" ")
      .toLowerCase();
    return text.includes(normalizedQuery);
  };

  const pages = PAGES_CONFIG.filter(matchesQuery).map((p) => ({
    ...p,
    onSelect: () => navigate(PAGE_PATHS[p.id] ?? "/"),
  }));

  const actionItems = actions.filter(matchesQuery).map((a) => ({
    id: a.id,
    label: a.label,
    description: a.description,
    icon: a.icon,
    keywords: a.keywords,
    onSelect: a.handler,
  }));

  // Add custom API search here:
  // const apiResults = await fetch(`/api/search?q=${query}`).then(r => r.json());

  const groups: SearchGroup[] = [];
  if (pages.length)
    groups.push({
      id: "pages",
      label: `Pages (${pages.length})`,
      items: pages,
    });
  if (actionItems.length)
    groups.push({
      id: "actions",
      label: `Actions (${actionItems.length})`,
      items: actionItems,
    });

  return groups;
}

// ============================================================================
// HOOK
// ============================================================================

export function useSearchResults() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounceValue(query, 150);

  const nextTheme = getNextTheme(theme);

  const actions: ActionConfig[] = useMemo(
    () => [
      {
        id: "logout",
        label: "Log Out",
        icon: RiLogoutBoxLine,
        keywords: ["sign out", "exit"],
        description: "Sign out of your account",
        handler: signOut,
      },
      {
        id: "theme",
        label: "Toggle Theme",
        icon: RiContrastLine,
        keywords: ["dark", "light", "system", "mode", "appearance"],
        description: `${formatThemeName(theme ?? "system")} → ${formatThemeName(nextTheme)}`,
        handler: () => setTheme(nextTheme),
      },
    ],
    [theme, nextTheme, setTheme],
  );

  const results = useMemo(
    () => performSearch(debouncedQuery, router.push, actions),
    [debouncedQuery, router.push, actions],
  );

  return { query, setQuery, results, isSearching: query !== debouncedQuery };
}
