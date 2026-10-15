"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CookieConsent } from "@repo/analytics/client";

export type CookieCategory = "necessary" | "analytics" | "marketing";

export type { CookieConsent };

interface CookieConsentState {
  consent: CookieConsent | null;
  hasInteracted: boolean;
  setConsent: (consent: CookieConsent) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  resetConsent: () => void;
}

const DEFAULT_CONSENT: CookieConsent = {
  necessary: true,
  analytics: false,
  marketing: false,
};

const FULL_CONSENT: CookieConsent = {
  necessary: true,
  analytics: true,
  marketing: true,
};

export const useCookieConsentStore = create<CookieConsentState>()(
  persist(
    (set) => ({
      consent: null,
      hasInteracted: false,
      setConsent: (consent) => set({ consent, hasInteracted: true }),
      acceptAll: () => set({ consent: FULL_CONSENT, hasInteracted: true }),
      rejectAll: () => set({ consent: DEFAULT_CONSENT, hasInteracted: true }),
      resetConsent: () => set({ consent: null, hasInteracted: false }),
    }),
    {
      name: "cookie-consent",
    },
  ),
);
