import { decodeShare } from "@repo/palette-core";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { OPEN_GRAPH, TWITTER } from "./share-constants";
import { PALETTE_OG, PALETTE_OG_PATH } from "./palette-og-constants";
import { paletteSummary } from "./palette-summary";

/**
 * Share metadata of a `?p=` link: the palette's name and its own preview
 * image. `null` when the link holds no valid palette.
 */
export function paletteShareMetadata(encoded: string): Metadata | null {
  const palette = decodeShare(encoded);
  if (!palette) return null;

  const query = new URLSearchParams({ p: encoded }).toString();
  const title = `${palette.name} · ${SITE.NAME}`;
  const { composition, label } = paletteSummary(palette);
  const blocks = composition.length === 1 ? "block" : "blocks";
  const description = `${composition.length} ${blocks} · ${label}`;
  const image = {
    url: `${PALETTE_OG_PATH}?${query}`,
    ...PALETTE_OG.SIZE,
    alt: `${palette.name}, a Minecraft block palette`,
  };

  return {
    title: { absolute: title },
    openGraph: {
      ...OPEN_GRAPH,
      url: `/?${query}`,
      title,
      description,
      images: [image],
    },
    twitter: { ...TWITTER, title, description, images: [image] },
  };
}
