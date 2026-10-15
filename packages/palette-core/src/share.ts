import { getBlock } from "./catalog";
import { createPalette, MAX_TILE_SIZE, type Palette } from "./pattern";

/**
 * Compact, versioned payload stored in the share link. Short keys keep URLs
 * reasonable; ids and timestamps are regenerated on import.
 */
interface SharePayloadV1 {
  v: 1;
  n: string;
  m: string;
  e: [string, number][];
  k: "r" | "f";
  s: "w" | "f";
  d: number;
  t: [number, number, (string | 0)[]];
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(encoded: string): string {
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
}

export function encodeShare(palette: Palette): string {
  const payload: SharePayloadV1 = {
    v: 1,
    n: palette.name,
    m: palette.mainBlockId,
    e: palette.entries.map((e) => [e.blockId, e.weight]),
    k: palette.mode === "fixed" ? "f" : "r",
    s: palette.surface === "floor" ? "f" : "w",
    d: palette.seed,
    t: [palette.tile.width, palette.tile.height, palette.tile.cells.map((c) => c ?? 0)],
  };
  return toBase64Url(JSON.stringify(payload));
}

const isKnown = (id: unknown): id is string => typeof id === "string" && !!getBlock(id);

/** Returns `null` for anything malformed or referencing unknown blocks. */
export function decodeShare(encoded: string): Palette | null {
  let payload: SharePayloadV1;
  try {
    payload = JSON.parse(fromBase64Url(encoded));
  } catch {
    return null;
  }
  if (payload?.v !== 1 || !isKnown(payload.m) || !Array.isArray(payload.e)) return null;

  const entries = payload.e
    .filter(([id, w]) => isKnown(id) && typeof w === "number" && w >= 0)
    .map(([blockId, weight]) => ({ blockId, weight }));
  const [width, height, cells] = Array.isArray(payload.t) ? payload.t : [4, 4, []];
  const w = Math.min(MAX_TILE_SIZE, Math.max(1, Number(width) || 4));
  const h = Math.min(MAX_TILE_SIZE, Math.max(1, Number(height) || 4));
  const tileCells = Array.from({ length: w * h }, (_, i) => {
    const c = Array.isArray(cells) ? cells[i] : undefined;
    return isKnown(c) ? c : null;
  });

  return createPalette(payload.m, {
    name: typeof payload.n === "string" ? payload.n.slice(0, 60) : "Palette partagée",
    entries: entries.length ? entries : [{ blockId: payload.m, weight: 100 }],
    mode: payload.k === "f" ? "fixed" : "random",
    surface: payload.s === "f" ? "floor" : "wall",
    seed: Number.isInteger(payload.d) ? payload.d : 1,
    tile: { width: w, height: h, cells: tileCells },
  });
}
