"use client";

import { useState } from "react";
import { RiSettings4Line } from "@repo/ui/icon";
import * as Modal from "@repo/ui/modal";
import * as Button from "@repo/ui/button";
import * as Switch from "@repo/ui/switch";
import { useCookieConsentStore, type CookieConsent } from "./cookie-store";

interface CookiePreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CookieCategoryRowProps {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

function CookieCategoryRow({
  title,
  description,
  checked,
  onCheckedChange,
  disabled = false,
}: CookieCategoryRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex-1">
        <p className="text-label-sm text-text-strong-950">{title}</p>
        <p className="text-paragraph-xs text-text-sub-600">{description}</p>
      </div>
      <Switch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}

export function CookiePreferencesModal({
  open,
  onOpenChange,
}: CookiePreferencesModalProps) {
  const { consent, setConsent } = useCookieConsentStore();

  const [preferences, setPreferences] = useState<CookieConsent>({
    necessary: true,
    analytics: consent?.analytics ?? false,
    marketing: consent?.marketing ?? false,
  });

  const handleSave = () => {
    setConsent(preferences);
    onOpenChange(false);
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content className="max-w-120">
        <Modal.Header
          icon={RiSettings4Line}
          title="Cookie Preferences"
          description="Manage your cookie preferences. You can enable or disable different types of cookies below."
        />
        <Modal.Body className="space-y-1 divide-y divide-stroke-soft-200">
          <CookieCategoryRow
            title="Necessary Cookies"
            description="Essential for the website to function properly. These cookies cannot be disabled."
            checked={preferences.necessary}
            onCheckedChange={() => {}}
            disabled
          />
          <CookieCategoryRow
            title="Analytics Cookies"
            description="Help us understand how visitors interact with our website by collecting anonymous information."
            checked={preferences.analytics}
            onCheckedChange={(checked) =>
              setPreferences((prev) => ({ ...prev, analytics: checked }))
            }
          />
          <CookieCategoryRow
            title="Marketing Cookies"
            description="Used to track visitors across websites to display relevant advertisements."
            checked={preferences.marketing}
            onCheckedChange={(checked) =>
              setPreferences((prev) => ({ ...prev, marketing: checked }))
            }
          />
        </Modal.Body>
        <Modal.Footer>
          <Button.Root
            variant="neutral"
            mode="stroke"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button.Root>
          <Button.Root onClick={handleSave}>Save Preferences</Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
