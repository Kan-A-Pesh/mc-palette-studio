import type { BlockInfo, FaceName } from "../catalog";

export type VariationMode = "color" | "family" | "gradient";

export interface VariationOptions {
  /** Face compared between blocks: "side" for walls, "top" for floors. */
  face?: FaceName;
  /** 0 (very strict) to 100 (very loose). */
  tolerance?: number;
  limit?: number;
  includeTransparent?: boolean;
  /** Only suggest blocks available in this Java release. */
  version?: string;
  catalog?: readonly BlockInfo[];
}

export interface Suggestion {
  block: BlockInfo;
  /** Perceptual distance to the base block (lower is closer). */
  distance: number;
}
