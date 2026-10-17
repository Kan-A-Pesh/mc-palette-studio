import {
  getBlock,
  tileUsage,
  toPercentages,
  worldEditPattern,
  type Palette,
} from "@repo/palette-core";
import { drawSurface } from "../draw/draw-surface";
import { prepareFaces } from "../draw/prepare-faces";
import { CARD_STYLE } from "../studio-constants";
import { createCanvas } from "../textures/create-canvas";
import { loadFaces } from "../textures/load-faces";
import { wallHeight } from "../preview/wall-height";

const SWATCH = 48;
const ROW = 64;
const MAX_COMMAND = 110;

/** A shareable PNG: palette swatches with proportions next to a preview. */
export async function renderPaletteCard(palette: Palette): Promise<Blob> {
  const { width, padding, columns, listWidth, background, text, muted } =
    CARD_STYLE;
  const composition = toPercentages(
    palette.mode === "fixed" ? tileUsage(palette) : palette.entries,
  );
  const face = "side";
  const [surfaceFaces, swatchFaces] = await Promise.all([
    prepareFaces(palette),
    loadFaces(
      composition.map((e) => e.blockId),
      [face],
    ),
  ]);

  const rows = wallHeight(columns);
  const cell = Math.floor((width - padding * 3 - listWidth) / columns);
  const top = padding + 108;
  const height =
    top + Math.max(cell * rows, composition.length * ROW) + padding + 48;
  const { canvas, ctx } = createCanvas(width, height);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = text;
  ctx.font = "600 40px system-ui, sans-serif";
  ctx.fillText(palette.name, padding, padding + 36);
  ctx.fillStyle = muted;
  ctx.font = "20px system-ui, sans-serif";
  const kind =
    palette.mode === "fixed"
      ? `Tile ${palette.tile.width}×${palette.tile.height}`
      : "Random";
  ctx.fillText(
    `${kind} · Minecraft Java ${palette.version}`,
    padding,
    padding + 72,
  );

  composition.forEach((entry, i) => {
    const y = top + i * ROW;
    const block = getBlock(entry.blockId);
    const texture = swatchFaces.get(`${entry.blockId}:${face}`);
    if (texture) ctx.drawImage(texture, padding, y, SWATCH, SWATCH);
    else {
      ctx.fillStyle = block?.faces[face].color ?? "#444";
      ctx.fillRect(padding, y, SWATCH, SWATCH);
    }
    ctx.fillStyle = text;
    ctx.font = "500 22px system-ui, sans-serif";
    ctx.fillText(block?.name ?? entry.blockId, padding + 64, y + 22);
    ctx.fillStyle = muted;
    ctx.font = "18px ui-monospace, Menlo, monospace";
    ctx.fillText(`${entry.weight}%  ${entry.blockId}`, padding + 64, y + 46);
  });

  drawSurface(ctx, palette, surfaceFaces, {
    columns,
    rows,
    cell,
    x: padding * 2 + listWidth,
    y: top,
  });

  ctx.fillStyle = muted;
  ctx.font = "16px ui-monospace, Menlo, monospace";
  const command =
    palette.mode === "fixed"
      ? "//set #clipboard"
      : `//set ${worldEditPattern(palette)}`;
  const shown =
    command.length > MAX_COMMAND
      ? `${command.slice(0, MAX_COMMAND - 1)}…`
      : command;
  ctx.fillText(shown, padding, height - padding + 8);

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("PNG export failed"))),
      "image/png",
    ),
  );
}
