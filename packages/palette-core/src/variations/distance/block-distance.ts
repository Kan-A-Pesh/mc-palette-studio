import type { BlockInfo, FaceName } from "../../catalog";
import { deltaE } from "./delta-e";

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
