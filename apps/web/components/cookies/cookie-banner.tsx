"use client";

import { useState, useEffect } from "react";
import { RiShieldCheckLine } from "@repo/ui/icon";
import * as Button from "@repo/ui/button";
import { useAnalytics } from "@repo/analytics/client";
import { useCookieConsentStore } from "./cookie-store";
import { CookiePreferencesModal } from "./cookie-preferences-modal";

interface CookieBannerProps {
  enabled?: boolean;
}

export function CookieBanner({ enabled = true }: CookieBannerProps) {
  const { consent, hasInteracted, acceptAll, rejectAll } =
    useCookieConsentStore();
  const { updateConsent } = useAnalytics();
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (consent) {
      updateConsent(consent);
    }
  }, [consent, updateConsent]);

  const handleAcceptAll = () => {
    acceptAll();
  };

  const handleRejectAll = () => {
    rejectAll();
  };

  if (!enabled || !mounted || hasInteracted) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-50 p-4">
        <div className="ml-auto max-w-md rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-weak-50">
              <RiShieldCheckLine className="size-5 text-text-sub-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-label-sm text-text-strong-950">
                We value your privacy
              </h3>
              <p className="mt-1 text-paragraph-xs text-text-sub-600">
                We use cookies to enhance your browsing experience, analyze site
                traffic, and personalize content. You can choose to accept all
                cookies, customize your preferences, or reject non-essential
                cookies.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button.Root size="small" onClick={handleAcceptAll}>
                  Accept All
                </Button.Root>
                <Button.Root
                  variant="neutral"
                  mode="stroke"
                  size="small"
                  onClick={() => setPreferencesOpen(true)}
                >
                  Customize
                </Button.Root>
                <Button.Root
                  variant="neutral"
                  mode="ghost"
                  size="small"
                  onClick={handleRejectAll}
                >
                  Reject All
                </Button.Root>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CookiePreferencesModal
        open={preferencesOpen}
        onOpenChange={setPreferencesOpen}
      />
    </>
  );
}
