import type { BlockInfo } from "../catalog";
import { deltaE } from "./distance";
import { variationCandidates } from "./variation-candidates";
import type { Suggestion, VariationOptions } from "./variation-types";

/**
 * Blocks sharing the base hue, ordered from darkest to lightest. The base
 * block is included so the ramp shows where it sits.
 */
export function gradient(
  base: BlockInfo,
  options: VariationOptions & { steps?: number } = {},
): Suggestion[] {
  const face = options.face ?? "side";
  const steps = options.steps ?? 7;
  const baseLab = base.faces[face].lab;
  const tolerance = (options.tolerance ?? 50) / 100;
  // Hue window in the a/b plane; neutral bases accept other neutrals.
  const hueRadius = 4 + tolerance * 26;
  // The ramp stays around the base so it reads as weathering, not a rainbow.
  const lightRange = 18 + tolerance * 30;
  const baseContrast = base.faces[face].contrast;
  const pool = [base, ...variationCandidates(base, options)]
    .map((block) => {
      const lab = block.faces[face].lab;
      return {
        block,
        lab,
        hueDistance:
          Math.hypot(lab[1] - baseLab[1], lab[2] - baseLab[2]) +
          0.5 * Math.abs(block.faces[face].contrast - baseContrast),
      };
    })
    .filter(
      (c) =>
        c.hueDistance <= hueRadius &&
        Math.abs(c.lab[0] - baseLab[0]) <= lightRange,
    )
    .sort((a, b) => a.lab[0] - b.lab[0]);
  const toSuggestion = (c: (typeof pool)[number]) => ({
    block: c.block,
    distance: deltaE(c.lab, baseLab),
  });
  const first = pool[0];
  const last = pool.at(-1);
  if (pool.length <= steps || !first || !last) return pool.map(toSuggestion);

  const picked = new Set<BlockInfo>([base]);
  for (let i = 0; i < steps && picked.size < steps; i++) {
    const target =
      first.lab[0] + ((last.lab[0] - first.lab[0]) * i) / (steps - 1);
    let best: (typeof pool)[number] | undefined;
    let bestScore = Infinity;
    for (const c of pool) {
      if (picked.has(c.block)) continue;
      // Favour the target lightness, then hue faithfulness.
      const score = Math.abs(c.lab[0] - target) + 0.35 * c.hueDistance;
      if (score < bestScore) {
        bestScore = score;
        best = c;
      }
    }
    if (best) picked.add(best.block);
  }
  return pool.filter((c) => picked.has(c.block)).map(toSuggestion);
}
