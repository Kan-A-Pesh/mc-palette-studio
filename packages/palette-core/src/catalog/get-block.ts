import { BLOCKS } from "./blocks";
import type { BlockInfo } from "./catalog-types";

const BY_ID = new Map(BLOCKS.map((b) => [b.id, b]));

export function getBlock(id: string): BlockInfo | undefined {
  return BY_ID.get(id);
}
