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
  isAvailable,
  LATEST_VERSION,
  MC_VERSIONS,
  resolveVersion,
  sameFamily,
  similarByColor,
  tileLayout,
  toPercentages,
  unavailableBlocks,
  withoutUnavailable,
  worldEditCommands,
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
    for (const id of [
      "bricks",
      "stone_bricks",
      "oak_planks",
      "white_concrete",
      "deepslate_tiles",
    ]) {
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
    expect(familyOf("light_blue_concrete_powder")).toEqual({
      family: "concrete_powder",
      dye: "light_blue",
    });
  });
});

describe("game versions", () => {
  it("lists releases newest first, from 1.14 to the catalog's", () => {
    expect(MC_VERSIONS[0]?.id).toBe(LATEST_VERSION);
    expect(MC_VERSIONS.at(-1)?.id).toBe("1.14");
    const dataVersions = MC_VERSIONS.map((v) => v.dataVersion);
    expect([...dataVersions].sort((a, b) => b - a)).toEqual(dataVersions);
  });

  it("records the release each block shipped in", () => {
    expect(block("bricks").since).toBe("1.14");
    expect(block("deepslate_tiles").since).toBe("1.17");
    // Registered behind an experiment in 1.19.3, released in 1.20.
    expect(block("cherry_planks").since).toBe("1.20");
    expect(block("pale_oak_planks").since).toBe("1.21.4");
    for (const b of BLOCKS) {
      expect(MC_VERSIONS.some((v) => v.id === b.since)).toBe(true);
    }
  });

  it("tells whether a block exists in a release", () => {
    expect(isAvailable(block("mud_bricks"), "1.18.2")).toBe(false);
    expect(isAvailable(block("mud_bricks"), "1.19")).toBe(true);
    expect(isAvailable(block("mud_bricks"), "1.20.1")).toBe(true);
    expect(isAvailable(block("bricks"), "1.14")).toBe(true);
  });

  it("falls back to the latest release for unknown ids", () => {
    expect(resolveVersion("1.12.2").id).toBe(LATEST_VERSION);
    expect(resolveVersion(undefined).id).toBe(LATEST_VERSION);
    expect(resolveVersion("1.20.1")).toEqual({
      id: "1.20.1",
      dataVersion: 3465,
    });
  });

  it("finds and drops unavailable blocks in the mix and the tile", async () => {
    const tile = createTile(2, 1);
    // Painted, then removed from the mix: the cell keeps the block.
    tile.cells[0] = "mud_bricks";
    tile.cells[1] = "granite";
    const palette = createPalette("packed_mud", {
      mode: "fixed",
      version: "1.18.2",
      entries: [
        { blockId: "packed_mud", weight: 50 },
        { blockId: "granite", weight: 30 },
        { blockId: "tuff", weight: 20 },
        // Added in 1.19, only in the mix.
        { blockId: "mangrove_planks", weight: 10 },
      ],
      tile,
    });
    const ids = (p: typeof palette) =>
      unavailableBlocks(p)
        .map((b) => b.id)
        .sort();
    expect(ids(palette)).toEqual([
      "mangrove_planks",
      "mud_bricks",
      "packed_mud",
    ]);

    const cleaned = { ...palette, ...withoutUnavailable(palette) };
    // The main block stays until the user picks another one.
    expect(ids(cleaned)).toEqual(["packed_mud"]);
    expect(cleaned.entries).toEqual([
      { blockId: "packed_mud", weight: 50 },
      { blockId: "granite", weight: 30 },
      { blockId: "tuff", weight: 20 },
    ]);
    expect(cleaned.tile.cells).toEqual([null, "granite"]);
    const nbt = new TextDecoder("latin1").decode(
      gunzipSync(await encodeSchematic(cleaned, "wall")),
    );
    expect(nbt).not.toContain("minecraft:mud_bricks");
  });

  it("only suggests blocks of the palette's release", () => {
    const options = { tolerance: 100, limit: 100, version: "1.16.5" };
    for (const s of [
      ...similarByColor(block("bricks"), options),
      ...sameFamily(block("stone_bricks"), options),
      ...gradient(block("bricks"), options).filter(
        (s) => s.block.id !== "bricks",
      ),
    ]) {
      expect(isAvailable(s.block, "1.16.5")).toBe(true);
    }
    const ids = (version?: string) =>
      sameFamily(block("polished_blackstone"), { version }).map(
        (s) => s.block.id,
      );
    expect(ids()).toContain("chiseled_polished_blackstone");
    expect(ids("1.15.2")).not.toContain("chiseled_polished_blackstone");
  });
});

describe("variations", () => {
  it("suggests warm, brick-like blocks for bricks", () => {
    const ids = similarByColor(block("bricks"), { limit: 10 }).map(
      (s) => s.block.id,
    );
    expect(ids.length).toBeGreaterThan(3);
    expect(ids).not.toContain("bricks");
    // Nothing cold or bright should appear among the closest matches.
    expect(ids).not.toContain("blue_concrete");
    expect(ids).not.toContain("white_wool");
  });

  it("orders colour suggestions by distance and honours tolerance", () => {
    const strict = similarByColor(block("stone_bricks"), { tolerance: 0 });
    const loose = similarByColor(block("stone_bricks"), {
      tolerance: 100,
      limit: 100,
    });
    expect(loose.length).toBeGreaterThan(strict.length);
    const distances = loose.map((s) => s.distance);
    expect([...distances].sort((a, b) => a - b)).toEqual(distances);
  });

  it("lists the official variants of a family first", () => {
    const ids = sameFamily(block("stone_bricks")).map((s) => s.block.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "mossy_stone_bricks",
        "cracked_stone_bricks",
        "chiseled_stone_bricks",
        "stone",
      ]),
    );
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
    expect(worldEditPattern(palette)).toBe(
      "50%bricks,30%granite,20%mud_bricks",
    );
  });

  it("round-trips a palette through the share link", () => {
    const tile = createTile(3, 2);
    tile.cells[4] = "granite";
    const palette = createPalette("bricks", {
      name: "Factory",
      entries: [
        { blockId: "bricks", weight: 70 },
        { blockId: "granite", weight: 30 },
      ],
      mode: "fixed",
      seed: 42,
      tile,
    });
    const decoded = decodeShare(encodeShare(palette));
    expect(decoded).toMatchObject({
      name: "Factory",
      mainBlockId: "bricks",
      entries: palette.entries,
      mode: "fixed",
      seed: 42,
      tile,
    });
    expect(decodeShare("not-a-palette")).toBeNull();
  });

  it("carries the target release in the share link", () => {
    const palette = createPalette("bricks", { version: "1.20.1" });
    expect(decodeShare(encodeShare(palette))?.version).toBe("1.20.1");
    // Links made before versions existed have no `r`.
    const legacy = { v: 1, n: "Old", m: "bricks", e: [["bricks", 1]] };
    const encoded = btoa(JSON.stringify(legacy)).replace(/=+$/, "");
    expect(decodeShare(encoded)?.version).toBe(LATEST_VERSION);
  });

  it("still reads links that carry a surface", () => {
    const legacy = { v: 1, n: "Old", m: "bricks", e: [["bricks", 1]], s: "f" };
    const encoded = btoa(JSON.stringify(legacy)).replace(/=+$/, "");
    expect(decodeShare(encoded)).toMatchObject({ mainBlockId: "bricks" });
    expect(decodeShare(encoded)).not.toHaveProperty("surface");
  });

  it("lays the tile flat for floors and upright for walls", () => {
    const tile = createTile(3, 2);
    tile.cells[0] = "granite"; // top-left
    const palette = createPalette("bricks", { mode: "fixed", tile });
    const floor = tileLayout(palette, "floor");
    expect([floor.width, floor.height, floor.length]).toEqual([3, 1, 2]);
    expect(floor.blockAt(0, 0, 0)).toBe("granite");
    const wall = tileLayout(palette, "wall");
    expect([wall.width, wall.height, wall.length]).toEqual([3, 2, 1]);
    // Row 0 is the top of the wall.
    expect(wall.blockAt(0, 1, 0)).toBe("granite");
    expect(wall.blockAt(0, 0, 0)).toBe("bricks");
    expect(worldEditCommands(palette, "floor")[0]?.command).toBe(
      "//schem load palette_floor_tile",
    );
  });

  it("encodes a gzipped Sponge schematic of the tile", async () => {
    const tile = createTile(2, 3, "granite");
    const palette = createPalette("bricks", { mode: "fixed", tile });
    const nbt = gunzipSync(await encodeSchematic(palette, "wall"));
    expect(nbt[0]).toBe(10); // root compound
    const text = new TextDecoder("latin1").decode(nbt);
    expect(text).toContain("Schematic");
    expect(text).toContain("minecraft:granite");
    expect(text).toContain("BlockData");
  });
});

describe("schematic NBT", () => {
  it("uses the standard tag ids (TAG_Int = 3, TAG_Short = 2)", async () => {
    const palette = createPalette("bricks", {
      mode: "fixed",
      tile: createTile(1, 1),
    });
    const nbt = gunzipSync(await encodeSchematic(palette, "wall"));
    const name = (s: string) => [0, s.length, ...Buffer.from(s)];
    const indexOf = (bytes: number[]) =>
      Buffer.from(nbt).indexOf(Buffer.from(bytes));
    expect(indexOf([3, ...name("Version"), 0, 0, 0, 2])).toBeGreaterThan(0);
    expect(indexOf([2, ...name("Width"), 0, 1])).toBeGreaterThan(0);
  });

  it("writes the data version of the palette's release", async () => {
    const dataVersionOf = async (version: string) => {
      const palette = createPalette("bricks", {
        mode: "fixed",
        version,
        tile: createTile(1, 1),
      });
      const nbt = Buffer.from(
        gunzipSync(await encodeSchematic(palette, "wall")),
      );
      const tag = Buffer.from([3, 0, 11, ...Buffer.from("DataVersion")]);
      return nbt.readInt32BE(nbt.indexOf(tag) + tag.length);
    };
    expect(await dataVersionOf("1.16.5")).toBe(2586);
    expect(await dataVersionOf("1.20.1")).toBe(3465);
  });
});
