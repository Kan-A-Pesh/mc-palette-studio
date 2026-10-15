import type { Tile } from "../pattern-types";

/** Keeps painted cells in place; new cells fall back to the main block. */
export function resizeTile(tile: Tile, width: number, height: number): Tile {
  const cells: (string | null)[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const inside = x < tile.width && y < tile.height;
      cells.push(inside ? (tile.cells[y * tile.width + x] ?? null) : null);
    }
  }
  return { width, height, cells };
}
