import type { FaceInfo } from "@repo/palette-core";

/**
 * Decoded faces shared by the 2D grid, the 3D scene and the PNG export:
 * canvases for drawing, data URLs for CSS backgrounds.
 */
export const textureCache = {
  canvases: new Map<string, Promise<HTMLCanvasElement>>(),
  urls: new Map<string, string>(),
  key: (face: FaceInfo) => `${face.texture}|${face.tint ?? ""}`,
};
