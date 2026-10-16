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
  /** Java release the palette is built for. */
  version: string;
  mode: PatternMode;
  surface: Surface;
  seed: number;
  tile: Tile;
  updatedAt: number;
}
