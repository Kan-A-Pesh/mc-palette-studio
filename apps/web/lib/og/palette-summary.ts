import { tileUsage, toPercentages, type Palette } from "@repo/palette-core";

/** Share of each block and the one-line description shown on palette cards. */
export function paletteSummary(palette: Palette) {
  const composition = toPercentages(
    palette.mode === "fixed" ? tileUsage(palette) : palette.entries,
  );
  const kind =
    palette.mode === "fixed"
      ? `Tile ${palette.tile.width}×${palette.tile.height}`
      : "Random";
  return { composition, label: `${kind} · Minecraft Java ${palette.version}` };
}
