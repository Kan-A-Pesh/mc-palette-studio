import type { FaceName, Palette } from "@repo/palette-core";

/** Floors show the top of the blocks, walls their side. */
export function surfaceFace(palette: Palette): FaceName {
  return palette.surface === "floor" ? "top" : "side";
}
