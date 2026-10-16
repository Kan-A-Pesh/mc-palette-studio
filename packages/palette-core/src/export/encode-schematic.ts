import { resolveVersion } from "../catalog";
import type { Palette, Surface } from "../pattern";
import { encodeSchematicNbt } from "./encode-schematic-nbt";
import { tileLayout } from "./tile-layout";

/** Gzipped `.schem` file of the palette's fixed tile, laid on `surface`. */
export async function encodeSchematic(
  palette: Palette,
  surface: Surface,
): Promise<Uint8Array> {
  const raw = encodeSchematicNbt(
    tileLayout(palette, surface),
    resolveVersion(palette.version).dataVersion,
  );
  const stream = new Blob([raw as BlobPart])
    .stream()
    .pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
