import type { Palette } from "../pattern";
import { encodeSchematicNbt } from "./encode-schematic-nbt";
import { tileLayout } from "./tile-layout";

/** Gzipped `.schem` file for the fixed tile of a palette. */
export async function encodeSchematic(palette: Palette): Promise<Uint8Array> {
  const raw = encodeSchematicNbt(tileLayout(palette));
  const stream = new Blob([raw as BlobPart])
    .stream()
    .pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
