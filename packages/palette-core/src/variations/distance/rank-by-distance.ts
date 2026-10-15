import type { BlockInfo, FaceName } from "../../catalog";
import { blockDistance } from "./block-distance";
import type { Suggestion } from "../variation-types";

/** Closest blocks to `base` first. */
export function rankByDistance(
  base: BlockInfo,
  blocks: BlockInfo[],
  face: FaceName,
): Suggestion[] {
  return blocks
    .map((block) => ({ block, distance: blockDistance(base, block, face) }))
    .sort((a, b) => a.distance - b.distance);
}
