/** Route serving the share image of a `?p=` palette link. */
export const PALETTE_OG_PATH = "/og/palette";

export const PALETTE_OG = {
  SIZE: { width: 1200, height: 630 },
  PADDING: 48,
  WALL: { columns: 20, rows: 11, cell: 32 },
  SWATCH: 48,
  /** Block rows that fit next to the wall. */
  MAX_ROWS: 5,
};
