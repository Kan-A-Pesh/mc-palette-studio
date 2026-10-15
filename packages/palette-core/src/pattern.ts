export type PatternMode = "random" | "fixed";
export type Surface = "floor" | "wall";

export interface WeightedBlock {
  blockId: string;
  /** Relative weight; normalised to percentages on export. */
  weight: number;
}

export interface Tile {
  width: number;
  height: number;
  /** Row-major block ids; `null` falls back to the main block. */
  cells: (string | null)[];
}

export interface Palette {
  id: string;
  name: string;
  mainBlockId: string;
  /** Blocks of the palette, main block first. */
  entries: WeightedBlock[];
  mode: PatternMode;
  surface: Surface;
  seed: number;
  tile: Tile;
  updatedAt: number;
}

export const MAX_TILE_SIZE = 8;

export function createTile(width: number, height: number, fill: string | null = null): Tile {
  return { width, height, cells: Array.from({ length: width * height }, () => fill) };
}

export function resizeTile(tile: Tile, width: number, height: number): Tile {
  const cells: (string | null)[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      cells.push(x < tile.width && y < tile.height ? (tile.cells[y * tile.width + x] ?? null) : null);
    }
  }
  return { width, height, cells };
}

export function createPalette(
  mainBlockId: string,
  init: Partial<Omit<Palette, "mainBlockId">> = {},
): Palette {
  return {
    id: init.id ?? Math.random().toString(36).slice(2, 10),
    name: init.name ?? "Nouvelle palette",
    mainBlockId,
    entries: init.entries ?? [{ blockId: mainBlockId, weight: 60 }],
    mode: init.mode ?? "random",
    surface: init.surface ?? "wall",
    seed: init.seed ?? 1,
    tile: init.tile ?? createTile(4, 4),
    updatedAt: init.updatedAt ?? Date.now(),
  };
}

/** Deterministic hash of a cell so the same seed always gives the same layout. */
export function cellRandom(x: number, y: number, seed: number, layer = 0): number {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(seed, 2147483647) ^ Math.imul(layer, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export function pickWeighted(entries: WeightedBlock[], r: number): string | null {
  const total = entries.reduce((sum, e) => sum + Math.max(0, e.weight), 0);
  if (total <= 0) return entries[0]?.blockId ?? null;
  let threshold = r * total;
  for (const entry of entries) {
    threshold -= Math.max(0, entry.weight);
    if (threshold < 0) return entry.blockId;
  }
  return entries.at(-1)?.blockId ?? null;
}

/**
 * Block id at (x, y) of the surface. `y` grows downward for walls (row 0 is the
 * top row) and along Z for floors.
 */
export function blockAt(palette: Palette, x: number, y: number, layer = 0): string {
  if (palette.mode === "fixed") {
    const { width, height, cells } = palette.tile;
    const cx = ((x % width) + width) % width;
    const cy = ((y % height) + height) % height;
    return cells[cy * width + cx] ?? palette.mainBlockId;
  }
  return pickWeighted(palette.entries, cellRandom(x, y, palette.seed, layer)) ?? palette.mainBlockId;
}

export function generateGrid(palette: Palette, width: number, height: number, layer = 0): string[][] {
  return Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => blockAt(palette, x, y, layer)),
  );
}

/**
 * Integer percentages summing to 100 (largest remainder method), entries with
 * no weight dropped.
 */
export function toPercentages(entries: WeightedBlock[]): WeightedBlock[] {
  const active = entries.filter((e) => e.weight > 0);
  const total = active.reduce((sum, e) => sum + e.weight, 0);
  if (!total) return [];
  const raw = active.map((e) => ({ ...e, exact: (e.weight / total) * 100 }));
  const floored = raw.map((e) => ({ ...e, weight: Math.floor(e.exact) }));
  let remaining = 100 - floored.reduce((sum, e) => sum + e.weight, 0);
  const order = [...floored].sort((a, b) => (b.exact - b.weight) - (a.exact - a.weight));
  for (const e of order) {
    if (remaining <= 0) break;
    e.weight += 1;
    remaining--;
  }
  return floored
    .filter((e) => e.weight > 0)
    .map(({ blockId, weight }) => ({ blockId, weight }));
}

/** Block usage counts of the fixed tile, for summaries and exports. */
export function tileUsage(palette: Palette): WeightedBlock[] {
  const counts = new Map<string, number>();
  for (const cell of palette.tile.cells) {
    const id = cell ?? palette.mainBlockId;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return [...counts].map(([blockId, weight]) => ({ blockId, weight }));
}
