import { BLOCKS, type BlockInfo, type FaceName, type Lab } from "./catalog";

export type VariationMode = "color" | "family" | "gradient";

export interface VariationOptions {
  /** Face compared between blocks: "side" for walls, "top" for floors. */
  face?: FaceName;
  /** 0 (very strict) to 100 (very loose). */
  tolerance?: number;
  limit?: number;
  includeTransparent?: boolean;
  catalog?: readonly BlockInfo[];
}

export interface Suggestion {
  block: BlockInfo;
  /** Perceptual distance to the base block (lower is closer). */
  distance: number;
}

export function deltaE(a: Lab, b: Lab): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

/** Colour distance plus a penalty for texture busyness mismatch. */
export function blockDistance(
  a: BlockInfo,
  b: BlockInfo,
  face: FaceName = "side",
): number {
  const fa = a.faces[face];
  const fb = b.faces[face];
  return deltaE(fa.lab, fb.lab) + 0.5 * Math.abs(fa.contrast - fb.contrast);
}

// Workstations, ores, light sources and glazed terracotta have strong,
// distinct faces: they match on average colour but never read as a variation.
const isDecorative = (b: BlockInfo) =>
  b.category === "utility" ||
  b.category === "light" ||
  b.id.endsWith("_ore") ||
  b.family === "glazed_terracotta";

function candidates(base: BlockInfo, options: VariationOptions) {
  const catalog = options.catalog ?? BLOCKS;
  return catalog.filter(
    (b) =>
      b.id !== base.id &&
      (options.includeTransparent || base.transparent || !b.transparent) &&
      (isDecorative(base) || !isDecorative(b)),
  );
}

const shapeOf = (id: string) => id.split("_").at(-1);

// Tolerance 0..100 maps onto a ΔE radius of 6..40.
const radiusFor = (tolerance: number) => 6 + (tolerance / 100) * 34;

export function similarByColor(
  base: BlockInfo,
  options: VariationOptions = {},
): Suggestion[] {
  const face = options.face ?? "side";
  const radius = radiusFor(options.tolerance ?? 50);
  return candidates(base, options)
    .map((block) => ({ block, distance: blockDistance(base, block, face) }))
    .filter((s) => s.distance <= radius)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, options.limit ?? 24);
}

export function sameFamily(
  base: BlockInfo,
  options: VariationOptions = {},
): Suggestion[] {
  const face = options.face ?? "side";
  const pool = candidates(base, { ...options, includeTransparent: true });
  const family = pool.filter((b) => b.family === base.family);
  // Dyed blocks also pair with the same colour in other materials.
  const sameDye = base.dye
    ? pool.filter((b) => b.dye === base.dye && b.family !== base.family)
    : [];
  const rank = (list: BlockInfo[]) =>
    list
      .map((block) => ({ block, distance: blockDistance(base, block, face) }))
      .sort((a, b) => a.distance - b.distance);
  // Small families (plain bricks…) borrow blocks with the same shape:
  // other bricks, tiles or planks, closest colour first.
  const shape = shapeOf(base.id);
  const sameShape =
    family.length + sameDye.length < 6 && ["bricks", "tiles", "planks", "pillar"].includes(shape ?? "")
      ? rank(pool.filter((b) => shapeOf(b.id) === shape && b.family !== base.family)).slice(0, 8)
      : [];
  return [...rank(family), ...rank(sameDye), ...sameShape].slice(0, options.limit ?? 24);
}

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
  const pool = [base, ...candidates(base, options)]
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
  if (pool.length <= steps) {
    return pool.map((c) => ({
      block: c.block,
      distance: deltaE(c.lab, baseLab),
    }));
  }

  const minL = pool[0]!.lab[0];
  const maxL = pool.at(-1)!.lab[0];
  const picked = new Set<BlockInfo>([base]);
  for (let i = 0; i < steps; i++) {
    const target = minL + ((maxL - minL) * i) / (steps - 1);
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
    if (picked.size >= steps) break;
  }
  return pool
    .filter((c) => picked.has(c.block))
    .map((c) => ({ block: c.block, distance: deltaE(c.lab, baseLab) }));
}

export function suggestVariations(
  base: BlockInfo,
  mode: VariationMode,
  options: VariationOptions = {},
): Suggestion[] {
  switch (mode) {
    case "color":
      return similarByColor(base, options);
    case "family":
      return sameFamily(base, options);
    case "gradient":
      return gradient(base, options);
  }
}
