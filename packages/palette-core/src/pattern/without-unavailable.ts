import type { Palette } from "./pattern-types";
import { unavailableBlocks } from "./unavailable-blocks";

/**
 * The mix and tile without the blocks the palette's release lacks. The main
 * block stays: only the user can pick its replacement.
 */
export function withoutUnavailable(
  palette: Palette,
): Pick<Palette, "entries" | "tile"> {
  const missing = new Set(
    unavailableBlocks(palette)
      .map((b) => b.id)
      .filter((id) => id !== palette.mainBlockId),
  );
  return {
    entries: palette.entries.filter((e) => !missing.has(e.blockId)),
    tile: {
      ...palette.tile,
      cells: palette.tile.cells.map((c) => (c && missing.has(c) ? null : c)),
    },
  };
}
