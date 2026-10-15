import { cellRandom } from "./cell-random";
import type { Palette } from "./pattern-types";
import { pickWeighted } from "./pick-weighted";

/**
 * Block id at (x, y) of the surface. `y` grows downward for walls (row 0 is
 * the top row) and along Z for floors. `layer` decorrelates several random
 * surfaces built from the same palette.
 */
export function blockAt(
  palette: Palette,
  x: number,
  y: number,
  layer = 0,
): string {
  if (palette.mode === "fixed") {
    const { width, height, cells } = palette.tile;
    const cx = ((x % width) + width) % width;
    const cy = ((y % height) + height) % height;
    return cells[cy * width + cx] ?? palette.mainBlockId;
  }
  const r = cellRandom(x, y, palette.seed, layer);
  return pickWeighted(palette.entries, r) ?? palette.mainBlockId;
}
