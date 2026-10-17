import { generateGrid, getBlock, type Palette } from "@repo/palette-core";

interface DrawOptions {
  columns: number;
  rows: number;
  cell: number;
  x: number;
  y: number;
}

/** Paints the palette as a wall, one side texture per block. */
export function drawSurface(
  ctx: CanvasRenderingContext2D,
  palette: Palette,
  faces: Map<string, HTMLCanvasElement>,
  { columns, rows, cell, x, y }: DrawOptions,
) {
  ctx.imageSmoothingEnabled = false;
  generateGrid(palette, columns, rows).forEach((row, r) =>
    row.forEach((id, c) => {
      const px = x + c * cell;
      const py = y + r * cell;
      const texture = faces.get(`${id}:side`);
      if (texture) {
        ctx.drawImage(texture, px, py, cell, cell);
        return;
      }
      ctx.fillStyle = getBlock(id)?.faces.side.color ?? "#444";
      ctx.fillRect(px, py, cell, cell);
    }),
  );
}
