import {
  generateGrid,
  getBlock,
  textureUrl,
  type FaceInfo,
  type Palette,
} from "@repo/palette-core";
import { PNG } from "pngjs";

/** First frame of a face, tinted, as square RGBA pixels. */
interface Face {
  size: number;
  data: Buffer;
}

const FETCH_TIMEOUT_MS = 5000;
const faces = new Map<string, Promise<Face | null>>();

const hexRgb = (hex: string) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

async function decodeFace(face: FaceInfo): Promise<Face | null> {
  const res = await globalThis.fetch(textureUrl(face), {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) return null;
  const png = PNG.sync.read(Buffer.from(await res.arrayBuffer()));
  // Animated textures are vertical strips: keep the top square.
  const size = png.width;
  const data = Buffer.from(png.data.subarray(0, size * size * 4));
  if (face.tint) {
    const tint = hexRgb(face.tint);
    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        data[i + c] = Math.round((data[i + c]! * tint[c]!) / 255);
      }
    }
  }
  return { size, data };
}

/** Cached per texture and tint; a failed fetch is retried on the next card. */
function loadFace(face: FaceInfo): Promise<Face | null> {
  const key = `${face.texture}|${face.tint ?? ""}`;
  const cached = faces.get(key);
  if (cached) return cached;
  const pending = decodeFace(face)
    .catch(() => null)
    .then((loaded) => {
      if (!loaded) faces.delete(key);
      return loaded;
    });
  faces.set(key, pending);
  return pending;
}

/** Copies a face into `target` as a `cell`-sized square, nearest neighbour. */
function paint(
  target: PNG,
  x: number,
  y: number,
  cell: number,
  blockId: string,
  face: Face | null,
) {
  const fallback = hexRgb(getBlock(blockId)?.faces.side.color ?? "#444444");
  for (let py = 0; py < cell; py++) {
    for (let px = 0; px < cell; px++) {
      const to = ((y + py) * target.width + x + px) * 4;
      if (!face) {
        target.data.set([...fallback, 255], to);
        continue;
      }
      const sx = Math.floor((px * face.size) / cell);
      const sy = Math.floor((py * face.size) / cell);
      const from = (sy * face.size + sx) * 4;
      face.data.copy(target.data, to, from, from + 4);
    }
  }
}

async function sideFaces(blockIds: Iterable<string>) {
  const ids = [...new Set(blockIds)];
  const loaded = await Promise.all(
    ids.map((id) => {
      const side = getBlock(id)?.faces.side;
      return side ? loadFace(side) : null;
    }),
  );
  return new Map(ids.map((id, i) => [id, loaded[i] ?? null]));
}

const toDataUrl = (png: PNG) =>
  `data:image/png;base64,${PNG.sync.write(png).toString("base64")}`;

interface WallOptions {
  columns: number;
  rows: number;
  cell: number;
}

/**
 * The palette's wall and one swatch per block as PNG data URLs, drawn with
 * the same side textures as the studio's PNG export.
 */
export async function rasterPalette(
  palette: Palette,
  swatchIds: string[],
  swatchSize: number,
  { columns, rows, cell }: WallOptions,
) {
  const grid = generateGrid(palette, columns, rows);
  const textures = await sideFaces([...grid.flat(), ...swatchIds]);

  const wall = new PNG({ width: columns * cell, height: rows * cell });
  grid.forEach((row, r) =>
    row.forEach((id, c) =>
      paint(wall, c * cell, r * cell, cell, id, textures.get(id) ?? null),
    ),
  );

  const swatches = new Map(
    swatchIds.map((id) => {
      const png = new PNG({ width: swatchSize, height: swatchSize });
      paint(png, 0, 0, swatchSize, id, textures.get(id) ?? null);
      return [id, toDataUrl(png)];
    }),
  );
  return { wall: toDataUrl(wall), swatches };
}
