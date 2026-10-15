"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import posthog, { type PostHog } from "posthog-js";
import type { AnalyticsEventName, AnalyticsEventProperties } from "../events";

export interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface AnalyticsContextValue {
  posthog: PostHog | null;
  trackEvent: <E extends AnalyticsEventName>(
    event: E,
    properties: AnalyticsEventProperties[E],
  ) => void;
  identifyUser: (userId: string, traits?: Record<string, unknown>) => void;
  resetUser: () => void;
  updateConsent: (consent: CookieConsent) => void;
  hasAnalyticsConsent: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export interface AnalyticsProviderProps {
  children: ReactNode;
  apiKey: string;
  host?: string;
  enabled?: boolean;
}

export function AnalyticsProvider({
  children,
  apiKey,
  host = "https://eu.i.posthog.com",
  enabled = true,
}: AnalyticsProviderProps) {
  const [hasAnalyticsConsent, setHasAnalyticsConsent] = useState(false);

  useEffect(() => {
    if (!enabled || !apiKey) return;

    posthog.init(apiKey, {
      api_host: host,
      person_profiles: "identified_only",
      capture_pageview: false,
      capture_pageleave: true,
      persistence: "localStorage+cookie",
      opt_out_capturing_by_default: true,
    });
  }, [apiKey, host, enabled]);

  const updateConsent = useCallback(
    (consent: CookieConsent) => {
      if (!enabled) return;

      if (consent.analytics) {
        posthog.opt_in_capturing();
        setHasAnalyticsConsent(true);
      } else {
        posthog.opt_out_capturing();
        setHasAnalyticsConsent(false);
      }
    },
    [enabled],
  );

  const contextValue = useMemo<AnalyticsContextValue>(
    () => ({
      posthog: enabled ? posthog : null,
      trackEvent: <E extends AnalyticsEventName>(
        event: E,
        properties: AnalyticsEventProperties[E],
      ) => {
        if (!enabled || !hasAnalyticsConsent) return;
        posthog.capture(event, properties);
      },
      identifyUser: (userId: string, traits?: Record<string, unknown>) => {
        if (!enabled || !hasAnalyticsConsent) return;
        posthog.identify(userId, traits);
      },
      resetUser: () => {
        if (!enabled) return;
        posthog.reset();
      },
      updateConsent,
      hasAnalyticsConsent,
    }),
    [enabled, hasAnalyticsConsent, updateConsent],
  );

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

function missingAnalyticsProvider(): never {
  throw new Error("useAnalytics must be used within an AnalyticsProvider");
}

export function useAnalytics(): AnalyticsContextValue {
  return useContext(AnalyticsContext) ?? missingAnalyticsProvider();
}
