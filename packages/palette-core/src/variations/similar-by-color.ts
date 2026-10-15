import type { BlockInfo } from "../catalog";
import { rankByDistance } from "./distance";
import { variationCandidates } from "./variation-candidates";
import type { Suggestion, VariationOptions } from "./variation-types";

// Tolerance 0..100 maps onto a ΔE radius of 6..40.
const radiusFor = (tolerance: number) => 6 + (tolerance / 100) * 34;

export function similarByColor(
  base: BlockInfo,
  options: VariationOptions = {},
): Suggestion[] {
  const radius = radiusFor(options.tolerance ?? 50);
  return rankByDistance(
    base,
    variationCandidates(base, options),
    options.face ?? "side",
  )
    .filter((s) => s.distance <= radius)
    .slice(0, options.limit ?? 24);
}
