import rawCatalog from "../data/blocks.json";

export const MC_VERSION = rawCatalog.version;

export const ASSETS_BASE_URL = `https://cdn.jsdelivr.net/gh/InventivetalentDev/minecraft-assets@${MC_VERSION}/assets/minecraft/textures`;

// Two-word dyes first so `light_gray_wool` is not read as `gray`.
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

/** Materials that come in the 16 dye colours. */
export const DYED_MATERIALS = new Set([
  "wool",
  "concrete",
  "concrete_powder",
  "terracotta",
  "glazed_terracotta",
  "stained_glass",
]);

/** Words that describe a variant rather than the material. */
export const FAMILY_MODIFIERS = new Set([
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

/** Shape words trimmed from the end of an id to find the material. */
export const FAMILY_SUFFIXES = new Set([
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

export const FAMILY_ALIASES: Record<string, string> = {
  cobblestone: "stone",
  bricks: "brick",
  dark_prismarine: "prismarine",
  red_nether: "nether",
  nether_wart: "nether",
  warped_wart: "warped",
  red_sand: "sand",
  red_sandstone: "sandstone",
  magma: "nether",
  netherrack: "nether",
  sculk_catalyst: "sculk",
  pale_moss: "moss",
  blue_ice: "ice",
  frosted_ice: "ice",
  copper_ore: "copper",
};

/** Glazed terracotta has a strong motif: it never reads as a variation. */
export const GLAZED_FAMILY = "glazed_terracotta";

/** First matching rule wins; anything else is stone. */
export const CATEGORY_RULES: [(typeof CATEGORIES)[number], RegExp][] = [
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
  ["wood", /_log$|_wood$|_planks$|_stem$|_hyphae$|bamboo|_leaves$|mushroom/],
  ["colored", /wool|concrete|terracotta|stained_glass/],
  [
    "earth",
    /dirt|grass|mud|clay|sand$|gravel|podzol|mycelium|moss|snow|ice|hay|pumpkin|melon|dripstone|sculk|honeycomb|bone_block|dried|resin|nylium/,
  ],
];
