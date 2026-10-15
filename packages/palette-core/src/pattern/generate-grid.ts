import { blockAt } from "./block-at";
import type { Palette } from "./pattern-types";

/** Rows of block ids for a `width` × `height` surface. */
export function generateGrid(
  palette: Palette,
  width: number,
  height: number,
  layer = 0,
): string[][] {
  return Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => blockAt(palette, x, y, layer)),
  );
}
