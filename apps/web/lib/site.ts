import { PROJECT } from "@repo/env/constants";

/** Name, URL and copy shared by metadata, the share images and JSON-LD. */
export const SITE = {
  NAME: PROJECT.NAME,
  URL: "https://palette.kan-a-pesh.fr",
  TITLE: "Palette Studio – Minecraft Block Palette Generator",
  DESCRIPTION:
    "Pick a Minecraft block and get blocks that match. Build a pattern, preview it in 3D and export it to WorldEdit. Free, no sign-up.",
  SHARE_DESCRIPTION:
    "A simple Minecraft block palette generator. Free, runs in your browser.",
  KEYWORDS: [
    "minecraft palette",
    "minecraft block palette",
    "minecraft palette generator",
    "block palette",
    "minecraft build palette",
    "worldedit",
    "minecraft gradient",
  ],
  COLORS: {
    CANVAS: "#0a0c10",
    PANEL: "#101317",
    LINE: "#23272b",
    TEXT: "#edeff1",
    MUTED: "#9a9fa6",
    ACCENT: "#5bcc80",
  },
} as const;
