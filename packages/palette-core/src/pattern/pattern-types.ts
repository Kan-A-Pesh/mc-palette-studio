export type PatternMode = "random" | "fixed";
/** Where a fixed tile is laid in the world, for schematic exports. */
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
  /** Java release the palette is built for. */
  version: string;
  mode: PatternMode;
  seed: number;
  tile: Tile;
  updatedAt: number;
}
