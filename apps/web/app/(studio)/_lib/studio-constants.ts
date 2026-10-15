import type { Category, VariationMode } from "@repo/palette-core";

/** Weight given to a block when it joins a palette. */
export const DEFAULT_WEIGHT = 20;

/** Weight of a new main block. */
export const MAIN_WEIGHT = 60;

/** Block used when a palette is created from scratch. */
export const NEW_PALETTE_BLOCK = "stone_bricks";

/** First palette of a new visitor: the factory example. */
export const STARTER_PALETTE = {
  name: "Factory",
  mainBlockId: "bricks",
  entries: [
    { blockId: "bricks", weight: 60 },
    { blockId: "granite", weight: 15 },
    { blockId: "mud_bricks", weight: 15 },
    { blockId: "packed_mud", weight: 10 },
  ],
};

/** The 3D scene keeps the block count reasonable. */
export const PREVIEW_3D_MAX_SIZE = 32;

/** How many suggestions "add the first ones" picks. */
export const QUICK_ADD_COUNT = 6;

export const CATEGORY_LABELS: Record<Category, string> = {
  stone: "Stone",
  wood: "Wood",
  colored: "Colored",
  earth: "Nature",
  metal: "Metal & ores",
  nether: "Nether",
  end: "End",
  ocean: "Ocean",
  light: "Light",
  utility: "Utility",
};

export const VARIATION_MODE_OPTIONS: { value: VariationMode; label: string }[] =
  [
    { value: "color", label: "Color" },
    { value: "family", label: "Family" },
    { value: "gradient", label: "Gradient" },
  ];

/** Colours of the exported PNG card (a canvas, so no CSS tokens). */
export const CARD_STYLE = {
  width: 1200,
  padding: 48,
  columns: 24,
  listWidth: 360,
  background: "#14161b",
  text: "#eef0f4",
  muted: "#9aa1ad",
};
