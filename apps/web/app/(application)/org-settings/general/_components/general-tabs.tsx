"use client";

import { RiArrowRightSLine } from "@repo/ui/icon";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { CursorLoader } from "@repo/ui/cursor-loader";
import * as TabMenuHorizontal from "@repo/ui/tab-menu-horizontal";
import * as TabMenuVertical from "@repo/ui/tab-menu-vertical";
import { tabStructure, tabLabels } from "./general-tabs-constants";
import { tabParsers } from "../search-params";
import ErrorCard from "./error-card";

export default function GeneralTabs() {
  const tabs = tabStructure.map((tab) => ({
    ...tab,
    label: tabLabels[tab.key],
  }));

  const [activeTab, setActiveTab] = useQueryState("tab", tabParsers.tab);
  const { reset } = useQueryErrorResetBoundary();

  return (
    <>
      {/* mobile */}
      <TabMenuHorizontal.Root
        className="md:hidden"
        onValueChange={setActiveTab}
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
              <ErrorBoundary
                fallbackRender={({ resetErrorBoundary }) => (
                  <ErrorCard onReload={resetErrorBoundary} />
                )}
                onReset={reset}
              >
                <Component />
              </ErrorBoundary>
            </Suspense>
          </TabMenuHorizontal.Content>
        ))}
      </TabMenuHorizontal.Root>

      {/* desktop */}
      <TabMenuVertical.Root
        className="hidden grid-cols-[auto_1fr] items-start gap-8 md:grid xl:grid-cols-[1fr_minmax(0,352px)_1fr]"
        onValueChange={setActiveTab}
        value={activeTab}
      >
        <div className="block w-tabs-nav shrink-0 rounded-2xl bg-bg-white-0 p-2.5 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset">
          <h4 className="mb-2 px-2 py-1 text-subheading-xs text-text-soft-400 uppercase">
            General Settings
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
              <ErrorBoundary
                fallbackRender={({ resetErrorBoundary }) => (
                  <ErrorCard
                    onReload={() => {
                      reset();
                      resetErrorBoundary();
                    }}
                  />
                )}
                onReset={reset}
              >
                <Component />
              </ErrorBoundary>
            </Suspense>
          </TabMenuVertical.Content>
        ))}
      </TabMenuVertical.Root>
    </>
  );
}
