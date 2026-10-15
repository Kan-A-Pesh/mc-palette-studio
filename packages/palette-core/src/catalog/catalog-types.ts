import type { CATEGORIES, DYE_COLORS } from "./catalog-constants";

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

export type DyeColor = (typeof DYE_COLORS)[number];

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
