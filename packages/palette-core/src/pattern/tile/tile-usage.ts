import type { Palette, WeightedBlock } from "../pattern-types";

/** Block usage counts of the fixed tile, for summaries and exports. */
export function tileUsage(palette: Palette): WeightedBlock[] {
  const counts = new Map<string, number>();
  for (const cell of palette.tile.cells) {
    const id = cell ?? palette.mainBlockId;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return [...counts].map(([blockId, weight]) => ({ blockId, weight }));
}
