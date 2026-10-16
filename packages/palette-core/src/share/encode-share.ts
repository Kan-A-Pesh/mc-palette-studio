import type { Palette } from "../pattern";
import { base64Url } from "./base64-url-constants";
import type { SharePayloadV1 } from "./share-types";

export function encodeShare(palette: Palette): string {
  const payload: SharePayloadV1 = {
    v: 1,
    n: palette.name,
    m: palette.mainBlockId,
    e: palette.entries.map((e) => [e.blockId, e.weight]),
    k: palette.mode === "fixed" ? "f" : "r",
    s: palette.surface === "floor" ? "f" : "w",
    d: palette.seed,
    r: palette.version,
    t: [
      palette.tile.width,
      palette.tile.height,
      palette.tile.cells.map((c) => c ?? 0),
    ],
  };
  return base64Url.encode(JSON.stringify(payload));
}
