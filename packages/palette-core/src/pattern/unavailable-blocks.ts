import { getBlock, isAvailable, type BlockInfo } from "../catalog";
import type { Palette } from "./pattern-types";

/** Blocks of the palette, in the mix or the fixed tile, its release lacks. */
export function unavailableBlocks(palette: Palette): BlockInfo[] {
  const ids = new Set([
    ...palette.entries.map((e) => e.blockId),
    ...palette.tile.cells.filter((c) => c !== null),
  ]);
  return [...ids].flatMap((id) => {
    const block = getBlock(id);
    return block && !isAvailable(block, palette.version) ? [block] : [];
  });
}
