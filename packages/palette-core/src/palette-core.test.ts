import { gunzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import {
  BLOCKS,
  createPalette,
  createTile,
  decodeShare,
  encodeSchematic,
  encodeShare,
  familyOf,
  generateGrid,
  getBlock,
  gradient,
  sameFamily,
  similarByColor,
  toPercentages,
  worldEditPattern,
} from "./index";

const block = (id: string) => {
  const b = getBlock(id);
  if (!b) throw new Error(`missing ${id}`);
  return b;
};

describe("catalog", () => {
  it("contains the common building blocks", () => {
    expect(BLOCKS.length).toBeGreaterThan(300);
    for (const id of ["bricks", "stone_bricks", "oak_planks", "white_concrete", "deepslate_tiles"]) {
      expect(getBlock(id)).toBeDefined();
    }
  });

  it("groups official variants into one family", () => {
    expect(familyOf("mossy_stone_bricks").family).toBe("stone");
    expect(familyOf("cracked_stone_bricks").family).toBe("stone");
    expect(familyOf("cobbled_deepslate").family).toBe("deepslate");
    expect(familyOf("deepslate_tiles").family).toBe("deepslate");
    expect(familyOf("stripped_dark_oak_log").family).toBe("dark_oak");
    expect(familyOf("deepslate_iron_ore").family).toBe("iron");
    expect(familyOf("weathered_cut_copper").family).toBe("copper");
    expect(familyOf("light_blue_concrete_powder")).toEqual({ family: "concrete_powder", dye: "light_blue" });
  });
});

describe("variations", () => {
  it("suggests warm, brick-like blocks for bricks", () => {
    const ids = similarByColor(block("bricks"), { limit: 10 }).map((s) => s.block.id);
    expect(ids.length).toBeGreaterThan(3);
    expect(ids).not.toContain("bricks");
    // Nothing cold or bright should appear among the closest matches.
    expect(ids).not.toContain("blue_concrete");
    expect(ids).not.toContain("white_wool");
  });

  it("orders colour suggestions by distance and honours tolerance", () => {
    const strict = similarByColor(block("stone_bricks"), { tolerance: 0 });
    const loose = similarByColor(block("stone_bricks"), { tolerance: 100, limit: 100 });
    expect(loose.length).toBeGreaterThan(strict.length);
    const distances = loose.map((s) => s.distance);
    expect([...distances].sort((a, b) => a - b)).toEqual(distances);
  });

  it("lists the official variants of a family first", () => {
    const ids = sameFamily(block("stone_bricks")).map((s) => s.block.id);
    expect(ids).toEqual(expect.arrayContaining(["mossy_stone_bricks", "cracked_stone_bricks", "chiseled_stone_bricks", "stone"]));
  });

  it("builds a dark-to-light ramp that includes the base block", () => {
    const ramp = gradient(block("bricks"), { steps: 6 });
    expect(ramp.map((s) => s.block.id)).toContain("bricks");
    const lightness = ramp.map((s) => s.block.faces.side.lab[0]);
    expect([...lightness].sort((a, b) => a - b)).toEqual(lightness);
  });
});

describe("patterns", () => {
  it("normalises weights to integer percentages summing to 100", () => {
    const result = toPercentages([
      { blockId: "a", weight: 1 },
      { blockId: "b", weight: 1 },
      { blockId: "c", weight: 1 },
      { blockId: "d", weight: 0 },
    ]);
    expect(result.reduce((s, e) => s + e.weight, 0)).toBe(100);
    expect(result.map((e) => e.blockId)).toEqual(["a", "b", "c"]);
  });

  it("random patterns are deterministic per seed and follow the weights", () => {
    const palette = createPalette("bricks", {
      entries: [
        { blockId: "bricks", weight: 80 },
        { blockId: "granite", weight: 20 },
      ],
    });
    const grid = generateGrid(palette, 50, 50);
    expect(generateGrid(palette, 50, 50)).toEqual(grid);
    const share = grid.flat().filter((id) => id === "bricks").length / 2500;
    expect(share).toBeGreaterThan(0.72);
    expect(share).toBeLessThan(0.88);
    expect(generateGrid({ ...palette, seed: 2 }, 50, 50)).not.toEqual(grid);
  });

  it("fixed patterns repeat the tile and fall back to the main block", () => {
    const tile = createTile(2, 2);
    tile.cells[0] = "granite";
    const palette = createPalette("bricks", { mode: "fixed", tile });
    expect(generateGrid(palette, 4, 2)).toEqual([
      ["granite", "bricks", "granite", "bricks"],
      ["bricks", "bricks", "bricks", "bricks"],
    ]);
  });
});

describe("exports", () => {
  it("writes the WorldEdit pattern syntax", () => {
    const palette = createPalette("bricks", {
      entries: [
        { blockId: "bricks", weight: 5 },
        { blockId: "granite", weight: 3 },
        { blockId: "mud_bricks", weight: 2 },
      ],
    });
    expect(worldEditPattern(palette)).toBe("50%bricks,30%granite,20%mud_bricks");
  });

  it("round-trips a palette through the share link", () => {
    const tile = createTile(3, 2);
    tile.cells[4] = "granite";
    const palette = createPalette("bricks", {
      name: "Usine",
      entries: [
        { blockId: "bricks", weight: 70 },
        { blockId: "granite", weight: 30 },
      ],
      mode: "fixed",
      surface: "floor",
      seed: 42,
      tile,
    });
    const decoded = decodeShare(encodeShare(palette));
    expect(decoded).toMatchObject({
      name: "Usine",
      mainBlockId: "bricks",
      entries: palette.entries,
      mode: "fixed",
      surface: "floor",
      seed: 42,
      tile,
    });
    expect(decodeShare("not-a-palette")).toBeNull();
  });

  it("encodes a gzipped Sponge schematic of the tile", async () => {
    const tile = createTile(2, 3, "granite");
    const palette = createPalette("bricks", { mode: "fixed", surface: "wall", tile });
    const nbt = gunzipSync(await encodeSchematic(palette));
    expect(nbt[0]).toBe(10); // root compound
    const text = new TextDecoder("latin1").decode(nbt);
    expect(text).toContain("Schematic");
    expect(text).toContain("minecraft:granite");
    expect(text).toContain("BlockData");
  });
});
