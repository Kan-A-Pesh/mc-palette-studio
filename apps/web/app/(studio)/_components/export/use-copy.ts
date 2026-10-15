"use client";

import { useState } from "react";
import { toast } from "@repo/ui/toast";

/** Copies text and remembers which button did it for ~1.5 s. */
export function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
    } catch {
      toast.error("Copy failed");
    }
  };
  return { copied, copy };
}
