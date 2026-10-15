"use client";

import { RiArrowRightSLine } from "@repo/ui/icon";
import { useQueryState } from "nuqs";
import { Suspense } from "react";

import { CursorLoader } from "@repo/ui/cursor-loader";
import * as TabMenuHorizontal from "@repo/ui/tab-menu-horizontal";
import * as TabMenuVertical from "@repo/ui/tab-menu-vertical";

import { tabStructure } from "./account-tabs-constants";

export default function AccountSettingsTabs() {
  const tabs = tabStructure.map((item) => {
    const labels: Record<string, string> = {
      myAccount: "My Account",
      appearance: "Appearance",
    };
    return {
      ...item,
      label: labels[item.key] || item.key,
    };
  });

  const [tab, setTab] = useQueryState("tab", {
    defaultValue: "myAccount",
    parse: (value) => {
      return tabs.some((item) => item.key === value) ? value : "myAccount";
    },
  });

  const activeTab = tab as (typeof tabs)[number]["key"] | (string & {});

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
          {tabs.map(({ key, label, icon: Icon }) => (
            <TabMenuHorizontal.Trigger key={key} value={key}>
              <TabMenuHorizontal.Icon as={Icon} />
              {label}
            </TabMenuHorizontal.Trigger>
          ))}
        </TabMenuHorizontal.List>

        {tabs.map(({ key, component: Component }) => (
          <TabMenuHorizontal.Content
            className="data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-4 data-[state=active]:animate-in data-[state=active]:duration-300"
            key={key}
            value={key}
          >
            <Suspense fallback={<CursorLoader />}>
              <Component />
            </Suspense>
          </TabMenuHorizontal.Content>
        ))}
      </TabMenuHorizontal.Root>

      {/* desktop */}
      <TabMenuVertical.Root
        className="hidden grid-cols-[auto_1fr] items-start gap-8 md:grid xl:grid-cols-[1fr_minmax(0,352px)_1fr]"
        onValueChange={handleTabChange}
        value={activeTab}
      >
        <div className="block w-tabs-nav shrink-0 rounded-2xl bg-bg-white-0 p-2.5 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset">
          <h4 className="mb-2 px-2 py-1 text-subheading-xs text-text-soft-400 uppercase">
            Account Settings
          </h4>
          <TabMenuVertical.List>
            {tabs.map(({ key, label, icon: Icon }) => (
              <TabMenuVertical.Trigger key={key} value={key}>
                <TabMenuVertical.Icon as={Icon} />
                {label}
                <TabMenuVertical.ArrowIcon as={RiArrowRightSLine} />
              </TabMenuVertical.Trigger>
            ))}
          </TabMenuVertical.List>
        </div>

        {tabs.map(({ key, component: Component }) => (
          <TabMenuVertical.Content
            className="data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-4 data-[state=active]:animate-in data-[state=active]:duration-300"
            key={key}
            value={key}
          >
            <Suspense fallback={<CursorLoader />}>
              <Component />
            </Suspense>
          </TabMenuVertical.Content>
        ))}
      </TabMenuVertical.Root>
    </>
  );
}
