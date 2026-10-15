import type { Tile } from "../pattern-types";

export function createTile(
  width: number,
  height: number,
  fill: string | null = null,
): Tile {
  return {
    width,
    height,
    cells: Array.from({ length: width * height }, () => fill),
  };
}
