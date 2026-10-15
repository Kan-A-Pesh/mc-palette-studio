import type { Palette } from "@repo/palette-core";
import { loadFaces } from "../textures/load-faces";
import { surfaceFace } from "./surface-face";

/** Textures needed to draw the palette's surface. */
export function prepareFaces(palette: Palette) {
  const painted = palette.tile.cells.filter((c): c is string => !!c);
  const ids = [
    palette.mainBlockId,
    ...palette.entries.map((e) => e.blockId),
    ...painted,
  ];
  return loadFaces(ids, [surfaceFace(palette)]);
}
