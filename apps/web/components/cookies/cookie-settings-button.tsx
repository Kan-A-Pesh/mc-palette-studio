"use client";

import { useState } from "react";
import { CookiePreferencesModal } from "./cookie-preferences-modal";

interface CookieSettingsButtonProps {
  className?: string;
}

export function CookieSettingsButton({ className }: CookieSettingsButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        Cookie Settings
      </button>
      <CookiePreferencesModal open={open} onOpenChange={setOpen} />
    </>
  );
}
