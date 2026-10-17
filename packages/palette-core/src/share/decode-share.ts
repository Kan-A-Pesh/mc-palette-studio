import { getBlock, resolveVersion } from "../catalog";
import { createPalette, MAX_TILE_SIZE, type Palette } from "../pattern";
import { base64Url } from "./base64-url-constants";
import type { SharePayloadV1 } from "./share-types";

const isKnown = (id: unknown): id is string =>
  typeof id === "string" && !!getBlock(id);

const clampSide = (value: unknown) =>
  Math.min(MAX_TILE_SIZE, Math.max(1, Number(value) || 4));

function parse(encoded: string): Partial<SharePayloadV1> | null {
  try {
    const value: unknown = JSON.parse(base64Url.decode(encoded));
    return value && typeof value === "object" ? value : null;
  } catch {
    // Truncated or hand-edited links are reported to the user as invalid.
    return null;
  }
}

/** Returns `null` for anything malformed or referencing unknown blocks. */
export function decodeShare(encoded: string): Palette | null {
  const payload = parse(encoded);
  if (payload?.v !== 1 || !isKnown(payload.m) || !Array.isArray(payload.e)) {
    return null;
  }
  const entries = payload.e
    .filter(([id, w]) => isKnown(id) && typeof w === "number" && w >= 0)
    .map(([blockId, weight]) => ({ blockId, weight }));
  const [width, height, cells] = Array.isArray(payload.t)
    ? payload.t
    : [4, 4, []];
  const w = clampSide(width);
  const h = clampSide(height);
  const tileCells = Array.from({ length: w * h }, (_, i) => {
    const cell = Array.isArray(cells) ? cells[i] : undefined;
    return isKnown(cell) ? cell : null;
  });

  return createPalette(payload.m, {
    name:
      typeof payload.n === "string" ? payload.n.slice(0, 60) : "Shared palette",
    entries: entries.length ? entries : [{ blockId: payload.m, weight: 100 }],
    version: resolveVersion(payload.r).id,
    mode: payload.k === "f" ? "fixed" : "random",
    surface: payload.s === "f" ? "floor" : "wall",
    seed: Number.isInteger(payload.d) ? Number(payload.d) : 1,
    tile: { width: w, height: h, cells: tileCells },
  });
}
