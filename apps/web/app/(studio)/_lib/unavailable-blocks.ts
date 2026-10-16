import {
  getBlock,
  isAvailable,
  type BlockInfo,
  type Palette,
} from "@repo/palette-core";

/** Blocks of the palette that its Java release does not have yet. */
export function unavailableBlocks(palette: Palette): BlockInfo[] {
  return palette.entries.flatMap((e) => {
    const block = getBlock(e.blockId);
    return block && !isAvailable(block, palette.version) ? [block] : [];
  });
}
