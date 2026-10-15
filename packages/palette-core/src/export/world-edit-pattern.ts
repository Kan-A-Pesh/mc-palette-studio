import { tileUsage, toPercentages, type Palette } from "../pattern";

/** WorldEdit pattern syntax: `50%bricks,30%granite,20%mud_bricks`. */
export function worldEditPattern(palette: Palette): string {
  const entries =
    palette.mode === "fixed" ? tileUsage(palette) : palette.entries;
  const percentages = toPercentages(entries);
  if (percentages.length === 1) return percentages[0]?.blockId ?? "";
  return percentages.map((e) => `${e.weight}%${e.blockId}`).join(",");
}
