"use client";

import { RiArrowRightSLine } from "@repo/ui/icon";
import { useQueryState } from "nuqs";
import { Suspense } from "react";

import { CursorLoader } from "@repo/ui/cursor-loader";
import * as TabMenuHorizontal from "@repo/ui/tab-menu-horizontal";
import * as TabMenuVertical from "@repo/ui/tab-menu-vertical";

import { privacySecurityTabs } from "./tabs";

export default function PrivacySecurityTabs() {
  const tabLabels: Record<string, string> = {
    changePassword: "Change Password",
    twoFactorSecurity: "2FA Security",
    activeSessions: "Active Sessions",
    deleteAccount: "Delete Account",
  };

  // Use nuqs for tab state management
  const [tab, setTab] = useQueryState("tab", {
    defaultValue: privacySecurityTabs[0].slug,
    parse: (value) => {
      return privacySecurityTabs.some((item) => item.slug === value)
        ? value
        : privacySecurityTabs[0].slug;
    },
  });

  // Use the tab state for the active tab
  const activeTab = tab as
    | (typeof privacySecurityTabs)[number]["slug"]
    | (string & {});

  // Handle tab change
  const handleTabChange = (value: string) => {
    setTab(value);
  };

  return (
    <>
      {/* mobile */}
      <TabMenuHorizontal.Root
        className="md:hidden"
        onValueChange={handleTabChange}
        value={activeTab}
      >
        <TabMenuHorizontal.List className="px-4" wrapperClassName="-mx-4 mb-6">
          {privacySecurityTabs.map(({ slug, key, icon: Icon }) => (
            <TabMenuHorizontal.Trigger key={slug} value={slug}>
              <TabMenuHorizontal.Icon as={Icon} />
              {tabLabels[key]}
            </TabMenuHorizontal.Trigger>
          ))}
        </TabMenuHorizontal.List>

        <Suspense fallback={<CursorLoader />}>
          {privacySecurityTabs.map(({ slug, component: Component }) => (
            <TabMenuHorizontal.Content
              className="data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-4 data-[state=active]:animate-in data-[state=active]:duration-300"
              key={slug}
              value={slug}
            >
              <Component />
            </TabMenuHorizontal.Content>
          ))}
        </Suspense>
      </TabMenuHorizontal.Root>

      {/* desktop */}
      <TabMenuVertical.Root
        className="hidden grid-cols-[auto_1fr] items-start gap-8 md:grid xl:grid-cols-[1fr_minmax(0,352px)_1fr]"
        onValueChange={handleTabChange}
        value={activeTab}
      >
        <div className="w-tabs-nav shrink-0 rounded-2xl bg-bg-white-0 p-2.5 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset">
          <h4 className="mb-2 px-2 py-1 text-subheading-xs text-text-soft-400 uppercase">
            Privacy & Security
          </h4>
          <TabMenuVertical.List>
            {privacySecurityTabs.map(({ slug, key, icon: Icon }) => (
              <TabMenuVertical.Trigger key={slug} value={slug}>
                <TabMenuVertical.Icon as={Icon} />
                {tabLabels[key]}
                <TabMenuVertical.ArrowIcon as={RiArrowRightSLine} />
              </TabMenuVertical.Trigger>
            ))}
          </TabMenuVertical.List>
        </div>

        <Suspense fallback={<CursorLoader />}>
          {privacySecurityTabs.map(({ slug, component: Component }) => (
            <TabMenuVertical.Content
              className="data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-4 data-[state=active]:animate-in data-[state=active]:duration-300"
              key={slug}
              value={slug}
            >
              <Component />
            </TabMenuVertical.Content>
          ))}
        </Suspense>
      </TabMenuVertical.Root>
    </>
  );
}
