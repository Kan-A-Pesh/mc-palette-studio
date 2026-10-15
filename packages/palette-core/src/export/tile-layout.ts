import type { Palette } from "../pattern";

export interface SchematicLayout {
  width: number;
  height: number;
  length: number;
  /** Block id at schematic coordinates. */
  blockAt: (x: number, y: number, z: number) => string;
}

/** Lays the fixed tile flat (floor) or upright (wall) in schematic space. */
export function tileLayout(palette: Palette): SchematicLayout {
  const { tile, mainBlockId } = palette;
  const cell = (cx: number, cy: number) =>
    tile.cells[cy * tile.width + cx] ?? mainBlockId;
  if (palette.surface === "floor") {
    return {
      width: tile.width,
      height: 1,
      length: tile.height,
      blockAt: (x, _y, z) => cell(x, z),
    };
  }
  // Wall rows are drawn top-down, schematic Y grows upward.
  return {
    width: tile.width,
    height: tile.height,
    length: 1,
    blockAt: (x, y) => cell(x, tile.height - 1 - y),
  };
}
