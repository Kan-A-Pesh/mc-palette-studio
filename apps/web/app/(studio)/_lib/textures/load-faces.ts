import { getBlock, type FaceName } from "@repo/palette-core";
import { loadFaceCanvas } from "./load-face-canvas";

/**
 * Loads every face needed by a set of blocks, keyed `blockId:face`. Missing
 * textures are left out: callers fall back to the average colour.
 */
export async function loadFaces(
  blockIds: Iterable<string>,
  faces: FaceName[],
): Promise<Map<string, HTMLCanvasElement>> {
  const result = new Map<string, HTMLCanvasElement>();
  const jobs = [...new Set(blockIds)].flatMap((id) =>
    faces.map(async (face) => {
      const info = getBlock(id)?.faces[face];
      if (!info) return;
      const canvas = await loadFaceCanvas(info).catch(() => null);
      if (canvas) result.set(`${id}:${face}`, canvas);
    }),
  );
  await Promise.all(jobs);
  return result;
}
