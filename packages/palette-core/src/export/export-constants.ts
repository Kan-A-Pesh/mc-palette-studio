import type { Surface } from "../pattern";

/** Names WorldEdit loads the fixed tile under (`//schem load …`). */
export const SCHEMATIC_FILE_NAMES: Record<Surface, string> = {
  floor: "palette_floor_tile",
  wall: "palette_wall_tile",
};

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
