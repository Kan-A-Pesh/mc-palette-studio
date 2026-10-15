import type { WeightedBlock } from "./pattern-types";

/**
 * Integer percentages summing to 100 (largest remainder method), entries with
 * no weight dropped.
 */
export function toPercentages(entries: WeightedBlock[]): WeightedBlock[] {
  const active = entries.filter((e) => e.weight > 0);
  const total = active.reduce((sum, e) => sum + e.weight, 0);
  if (!total) return [];
  const rows = active.map((e) => {
    const exact = (e.weight / total) * 100;
    return { blockId: e.blockId, exact, weight: Math.floor(exact) };
  });
  let remaining = 100 - rows.reduce((sum, e) => sum + e.weight, 0);
  const byRemainder = [...rows].sort(
    (a, b) => b.exact - b.weight - (a.exact - a.weight),
  );
  for (const row of byRemainder) {
    if (remaining <= 0) break;
    row.weight += 1;
    remaining--;
  }
  return rows
    .filter((e) => e.weight > 0)
    .map(({ blockId, weight }) => ({ blockId, weight }));
}
