import type { WeightedBlock } from "./pattern-types";

/** Maps `r` in [0, 1) onto the weighted entries. */
export function pickWeighted(
  entries: WeightedBlock[],
  r: number,
): string | null {
  const total = entries.reduce((sum, e) => sum + Math.max(0, e.weight), 0);
  if (total <= 0) return entries[0]?.blockId ?? null;
  let threshold = r * total;
  for (const entry of entries) {
    threshold -= Math.max(0, entry.weight);
    if (threshold < 0) return entry.blockId;
  }
  return entries.at(-1)?.blockId ?? null;
}
