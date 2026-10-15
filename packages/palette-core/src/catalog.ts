import rawCatalog from "./data/blocks.json";

export type Lab = [number, number, number];

export interface FaceInfo {
  /** Texture path relative to `assets/minecraft/textures`, without extension. */
  texture: string;
  /** Biome tint multiplied over the texture, when the face is tinted. */
  tint?: string;
  /** Average colour of the (tinted) texture. */
  color: string;
  lab: Lab;
  /** Standard deviation of lightness across the texture: how "busy" it looks. */
  contrast: number;
  /** Share of opaque pixels (glass and leaves are below 1). */
  opacity: number;
  animated: boolean;
}

export type FaceName = "top" | "side" | "bottom";

export const DYE_COLORS = [
  "light_gray",
  "light_blue",
  "white",
  "gray",
  "black",
  "brown",
  "red",
  "orange",
  "yellow",
  "lime",
  "green",
  "cyan",
  "blue",
  "purple",
  "magenta",
  "pink",
] as const;
export type DyeColor = (typeof DYE_COLORS)[number];

export const CATEGORIES = [
  "stone",
  "wood",
  "colored",
  "earth",
  "metal",
  "nether",
  "end",
  "ocean",
  "light",
  "utility",
] as const;
export type Category = (typeof CATEGORIES)[number];

export interface BlockInfo {
  id: string;
  name: string;
  faces: Record<FaceName, FaceInfo>;
  /** Material root shared by official variants: `mossy_stone_bricks` → `stone`. */
  family: string;
  dye?: DyeColor;
  category: Category;
  transparent: boolean;
}

interface RawCatalog {
  version: string;
  blocks: { id: string; faces: Record<FaceName, FaceInfo> }[];
}

const catalogData = rawCatalog as unknown as RawCatalog;

export const MC_VERSION = catalogData.version;
export const ASSETS_BASE_URL = `https://cdn.jsdelivr.net/gh/InventivetalentDev/minecraft-assets@${MC_VERSION}/assets/minecraft/textures`;

export function textureUrl(face: FaceInfo): string {
  return `${ASSETS_BASE_URL}/${face.texture}.png`;
}

// Materials that come in the 16 dye colours.
const DYED_MATERIALS = new Set([
  "wool",
  "concrete",
  "concrete_powder",
  "terracotta",
  "glazed_terracotta",
  "stained_glass",
]);

const MODIFIERS = new Set([
  "mossy",
  "cracked",
  "chiseled",
  "polished",
  "smooth",
  "cut",
  "stripped",
  "exposed",
  "weathered",
  "oxidized",
  "cobbled",
  "dead",
  "gilded",
  "reinforced",
  "packed",
  "raw",
  "crying",
  "flowering",
  "muddy",
  "rooted",
  "coarse",
  "wet",
  "tinted",
]);

const SUFFIXES = new Set([
  "bricks",
  "brick",
  "tiles",
  "block",
  "pillar",
  "wood",
  "log",
  "planks",
  "hyphae",
  "stem",
  "leaves",
  "ore",
  "bulb",
  "grate",
  "mosaic",
  "powder",
  "roots",
  "lamp",
]);

const FAMILY_ALIASES: Record<string, string> = {
  cobblestone: "stone",
  bricks: "brick",
  dark_prismarine: "prismarine",
  red_nether: "nether",
  nether_wart: "nether",
  warped_wart: "warped",
  red_sand: "sand",
  red_sandstone: "sandstone",
  basalt: "basalt",
  end_stone: "end_stone",
  purpur: "purpur",
  magma: "nether",
  netherrack: "nether",
  dirt: "dirt",
  mud: "mud",
  sculk_catalyst: "sculk",
  pale_moss: "moss",
  blue_ice: "ice",
  frosted_ice: "ice",
  copper_ore: "copper",
};

function stripDye(id: string): { dye?: DyeColor; rest: string } {
  for (const dye of DYE_COLORS) {
    if (id.startsWith(`${dye}_`)) {
      const rest = id.slice(dye.length + 1);
      if (DYED_MATERIALS.has(rest)) return { dye, rest };
    }
  }
  return { rest: id };
}

export function familyOf(id: string): { family: string; dye?: DyeColor } {
  const { dye, rest } = stripDye(id);
  if (dye) return { family: rest, dye };
  if (FAMILY_ALIASES[id]) return { family: FAMILY_ALIASES[id] };

  let tokens = rest.split("_");
  // Ore hosts: deepslate_iron_ore / nether_gold_ore belong to the metal.
  if (
    tokens.at(-1) === "ore" &&
    tokens.length > 2 &&
    (tokens[0] === "deepslate" || tokens[0] === "nether")
  ) {
    tokens = tokens.slice(1);
  }
  tokens = tokens.filter((t) => !MODIFIERS.has(t));
  while (tokens.length > 1 && SUFFIXES.has(tokens.at(-1)!)) tokens.pop();
  if (tokens[0] === "light" || tokens[0] === "dark") {
    // Keep dark_oak, but fold "dark_prismarine"-like names into their root.
    if (!(tokens[1] === "oak")) tokens = tokens.slice(1);
  }
  const joined = tokens.join("_") || id;
  return { family: FAMILY_ALIASES[joined] ?? joined };
}

const CATEGORY_RULES: [Category, RegExp][] = [
  [
    "light",
    /glowstone|lantern|froglight|shroomlight|redstone_lamp|jack_o_lantern|copper_bulb|crying_obsidian|magma/,
  ],
  [
    "nether",
    /nether|crimson|warped|blackstone|basalt|soul_|quartz|ancient_debris|respawn_anchor|netherite/,
  ],
  ["end", /end_stone|purpur|chorus/],
  ["ocean", /prismarine|coral|sponge|kelp|sea_/],
  [
    "metal",
    /copper|iron|gold|diamond|emerald|lapis|redstone|coal|netherite|amethyst|_ore$|raw_|lodestone/,
  ],
  [
    "utility",
    /table|furnace|smoker|dispenser|dropper|observer|piston|barrel|bookshelf|jukebox|note_block|loom|crafter|tnt|target|beehive|bee_nest|creaking_heart|sculk_catalyst/,
  ],
  [
    "wood",
    /_log$|_wood$|_planks$|_stem$|_hyphae$|bamboo|_leaves$|mushroom/,
  ],
  [
    "colored",
    /wool|concrete|terracotta|stained_glass/,
  ],
  [
    "earth",
    /dirt|grass|mud|clay|sand$|gravel|podzol|mycelium|moss|snow|ice|hay|pumpkin|melon|dripstone|sculk|honeycomb|bone_block|dried|resin|nylium/,
  ],
];

export function categoryOf(id: string): Category {
  for (const [category, rule] of CATEGORY_RULES) {
    if (rule.test(id)) return category;
  }
  return "stone";
}

export function displayName(id: string): string {
  const words = id.split("_").join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export const BLOCKS: readonly BlockInfo[] = catalogData.blocks.map((b) => {
  const { family, dye } = familyOf(b.id);
  return {
    id: b.id,
    name: displayName(b.id),
    faces: b.faces,
    family,
    dye,
    category: categoryOf(b.id),
    transparent: Object.values(b.faces).some((f) => f.opacity < 0.98),
  };
});

const BY_ID = new Map(BLOCKS.map((b) => [b.id, b]));

export function getBlock(id: string): BlockInfo | undefined {
  return BY_ID.get(id);
}
