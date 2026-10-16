import type { Palette } from "@repo/palette-core";
import { loadFaces } from "../textures/load-faces";
/** Side textures needed to draw the palette as a wall. */
export function prepareFaces(palette: Palette) {
  const painted = palette.tile.cells.filter((c): c is string => !!c);
  const ids = [
    palette.mainBlockId,
    ...palette.entries.map((e) => e.blockId),
    ...painted,
  ];
  return loadFaces(ids, ["side"]);
}
