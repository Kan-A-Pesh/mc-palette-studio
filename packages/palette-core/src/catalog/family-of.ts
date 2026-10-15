import {
  DYE_COLORS,
  DYED_MATERIALS,
  FAMILY_ALIASES,
  FAMILY_MODIFIERS,
  FAMILY_SUFFIXES,
} from "./catalog-constants";
import type { DyeColor } from "./catalog-types";

function stripDye(id: string): { dye?: DyeColor; rest: string } {
  for (const dye of DYE_COLORS) {
    if (id.startsWith(`${dye}_`)) {
      const rest = id.slice(dye.length + 1);
      if (DYED_MATERIALS.has(rest)) return { dye, rest };
    }
  }
  return { rest: id };
}

/** Material root shared by official variants: `mossy_stone_bricks` → `stone`. */
export function familyOf(id: string): { family: string; dye?: DyeColor } {
  const { dye, rest } = stripDye(id);
  if (dye) return { family: rest, dye };
  const alias = FAMILY_ALIASES[id];
  if (alias) return { family: alias };

  let tokens = rest.split("_");
  // Ore hosts: deepslate_iron_ore / nether_gold_ore belong to the metal.
  if (
    tokens.at(-1) === "ore" &&
    tokens.length > 2 &&
    (tokens[0] === "deepslate" || tokens[0] === "nether")
  ) {
    tokens = tokens.slice(1);
  }
  tokens = tokens.filter((t) => !FAMILY_MODIFIERS.has(t));
  while (tokens.length > 1 && FAMILY_SUFFIXES.has(tokens.at(-1) ?? "")) {
    tokens.pop();
  }
  const joined = tokens.join("_") || id;
  return { family: FAMILY_ALIASES[joined] ?? joined };
}
