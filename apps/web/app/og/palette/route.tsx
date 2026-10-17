import { decodeShare } from "@repo/palette-core";
import { ImageResponse } from "next/og";
import PaletteOgCard from "@/lib/og/palette-og-card";
import { PALETTE_OG } from "@/lib/og/palette-og-constants";
import { paletteSummary } from "@/lib/og/palette-summary";
import { rasterPalette } from "@/lib/og/raster-textures";

export async function GET(request: Request) {
  const encoded = new URL(request.url).searchParams.get("p");
  const palette = encoded ? decodeShare(encoded) : null;
  if (!palette) return new Response("Invalid palette", { status: 404 });

  const { composition, label } = paletteSummary(palette);
  const fits = composition.length <= PALETTE_OG.MAX_ROWS;
  const rows = composition.slice(0, PALETTE_OG.MAX_ROWS - (fits ? 0 : 1));
  const { wall, swatches } = await rasterPalette(
    palette,
    rows.map((e) => e.blockId),
    PALETTE_OG.SWATCH,
    PALETTE_OG.WALL,
  );

  return new ImageResponse(
    (
      <PaletteOgCard
        palette={palette}
        label={label}
        rows={rows}
        hidden={composition.length - rows.length}
        wall={wall}
        swatches={swatches}
      />
    ),
    {
      ...PALETTE_OG.SIZE,
      // A link always encodes the same palette, so its image never changes.
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    },
  );
}
