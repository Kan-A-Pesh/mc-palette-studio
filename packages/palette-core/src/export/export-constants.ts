/** Name WorldEdit loads the fixed tile under (`//schem load palette_tile`). */
export const SCHEMATIC_FILE_NAME = "palette_tile";

/** Data version of 1.21.4: newer servers upgrade it, older blocks are unchanged. */
export const SCHEMATIC_DATA_VERSION = 4189;

/** NBT tag ids used by the Sponge schematic format. */
export const NBT_TAG = {
  byte: 1,
  short: 2,
  int: 3,
  byteArray: 7,
  string: 8,
  compound: 10,
  intArray: 11,
} as const;
