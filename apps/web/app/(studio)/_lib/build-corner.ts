import { blockAt, type Palette } from "@repo/palette-core";

interface Placement {
  id: string;
  x: number;
  y: number;
  z: number;
}

/**
 * A corner of a building: a floor and two walls built with the palette.
 * Each surface uses its own random layer so they do not mirror each other.
 */
export function buildCorner(palette: Palette, size: number): Placement[] {
  const height = Math.max(4, Math.round(size * 0.56));
  const placements: Placement[] = [];
  for (let x = 0; x < size; x++) {
    for (let z = 0; z < size; z++) {
      placements.push({ id: blockAt(palette, x, z, 1), x, y: -1, z });
    }
  }
  for (let y = 0; y < height; y++) {
    const row = height - 1 - y;
    for (let i = -1; i < size; i++) {
      // i = -1 is the shared corner column.
      const back = blockAt(palette, Math.max(0, i), row, 2);
      placements.push({ id: back, x: i, y, z: -1 });
      if (i >= 0) {
        placements.push({ id: blockAt(palette, i, row, 3), x: -1, y, z: i });
      }
    }
  }
  return placements;
}
