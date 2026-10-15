/** Deterministic hash of a cell so the same seed always gives the same layout. */
export function cellRandom(
  x: number,
  y: number,
  seed: number,
  layer = 0,
): number {
  let h =
    Math.imul(x, 374761393) ^
    Math.imul(y, 668265263) ^
    Math.imul(seed, 2147483647) ^
    Math.imul(layer, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
