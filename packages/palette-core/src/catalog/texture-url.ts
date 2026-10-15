import { ASSETS_BASE_URL } from "./catalog-constants";
import type { FaceInfo } from "./catalog-types";

/** Texture PNG on the public assets mirror (never stored in this repository). */
export function textureUrl(face: FaceInfo): string {
  return `${ASSETS_BASE_URL}/${face.texture}.png`;
}
