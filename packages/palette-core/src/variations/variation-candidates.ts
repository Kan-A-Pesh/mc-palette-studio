import { BLOCKS, GLAZED_FAMILY, isAvailable, type BlockInfo } from "../catalog";
import type { VariationOptions } from "./variation-types";

// Workstations, ores, light sources and glazed terracotta have strong,
// distinct faces: they match on average colour but never read as a variation.
const isDecorative = (b: BlockInfo) =>
  b.category === "utility" ||
  b.category === "light" ||
  b.id.endsWith("_ore") ||
  b.family === GLAZED_FAMILY;

/** Blocks worth suggesting next to `base`. */
export function variationCandidates(
  base: BlockInfo,
  options: VariationOptions,
): BlockInfo[] {
  const catalog = options.catalog ?? BLOCKS;
  return catalog.filter(
    (b) =>
      b.id !== base.id &&
      (!options.version || isAvailable(b, options.version)) &&
      (options.includeTransparent || base.transparent || !b.transparent) &&
      (isDecorative(base) || !isDecorative(b)),
  );
}
