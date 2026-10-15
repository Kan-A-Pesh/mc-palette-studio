import type { Palette } from "@repo/palette-core";

/** Rows shown for a given column count: square floors, wide walls. */
export function surfaceRows(palette: Palette, columns: number): number {
  return palette.surface === "floor"
    ? columns
    : Math.max(4, Math.round(columns * 0.56));
}
