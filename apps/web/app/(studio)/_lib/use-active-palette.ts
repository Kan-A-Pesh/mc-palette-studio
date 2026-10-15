"use client";

import type { Palette } from "@repo/palette-core";
import { useStudio } from "./studio-store";

/** The palette being edited (falls back to any palette if the id is stale). */
export function useActivePalette(): Palette {
  return useStudio((s) => {
    const palette = s.palettes[s.activeId] ?? Object.values(s.palettes)[0];
    if (!palette) throw new Error("Palette store is empty");
    return palette;
  });
}
