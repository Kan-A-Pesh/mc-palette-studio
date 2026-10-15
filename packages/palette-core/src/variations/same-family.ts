import type { BlockInfo } from "../catalog";
import { rankByDistance } from "./distance";
import { variationCandidates } from "./variation-candidates";
import type { Suggestion, VariationOptions } from "./variation-types";

const shapeOf = (id: string) => id.split("_").at(-1) ?? "";
const BORROWABLE_SHAPES = new Set(["bricks", "tiles", "planks", "pillar"]);

/**
 * Official variants of the same material, then the same dye in other
 * materials. Small families (plain bricks…) borrow blocks with the same
 * shape: other bricks, tiles or planks, closest colour first.
 */
export function sameFamily(
  base: BlockInfo,
  options: VariationOptions = {},
): Suggestion[] {
  const face = options.face ?? "side";
  const pool = variationCandidates(base, {
    ...options,
    includeTransparent: true,
  });
  const family = pool.filter((b) => b.family === base.family);
  const sameDye = base.dye
    ? pool.filter((b) => b.dye === base.dye && b.family !== base.family)
    : [];
  const shape = shapeOf(base.id);
  const sameShape =
    family.length + sameDye.length < 6 && BORROWABLE_SHAPES.has(shape)
      ? rankByDistance(
          base,
          pool.filter(
            (b) => shapeOf(b.id) === shape && b.family !== base.family,
          ),
          face,
        ).slice(0, 8)
      : [];
  return [
    ...rankByDistance(base, family, face),
    ...rankByDistance(base, sameDye, face),
    ...sameShape,
  ].slice(0, options.limit ?? 24);
}
