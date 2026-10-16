import { LATEST_VERSION } from "../catalog";
import type { Palette } from "./pattern-types";
import { createTile } from "./tile";

export function createPalette(
  mainBlockId: string,
  init: Partial<Omit<Palette, "mainBlockId">> = {},
): Palette {
  return {
    id: init.id ?? Math.random().toString(36).slice(2, 10),
    name: init.name ?? "New palette",
    mainBlockId,
    entries: init.entries ?? [{ blockId: mainBlockId, weight: 60 }],
    version: init.version ?? LATEST_VERSION,
    mode: init.mode ?? "random",
    seed: init.seed ?? 1,
    tile: init.tile ?? createTile(4, 4),
    updatedAt: init.updatedAt ?? Date.now(),
  };
}
