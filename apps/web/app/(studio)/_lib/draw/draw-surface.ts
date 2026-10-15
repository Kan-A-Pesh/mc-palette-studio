import { generateGrid, getBlock, type Palette } from "@repo/palette-core";
import { surfaceFace } from "./surface-face";

interface DrawOptions {
  columns: number;
  rows: number;
  cell: number;
  x?: number;
  y?: number;
  grid?: boolean;
}

const GRID_LINE = "oklch(0% 0 0 / 0.28)";
const TILE_OUTLINE = "oklch(100% 0 0 / 0.55)";

function drawGrid(
  ctx: CanvasRenderingContext2D,
  { columns, rows, cell, x = 0, y = 0 }: DrawOptions,
) {
  ctx.strokeStyle = GRID_LINE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let c = 1; c < columns; c++) {
    ctx.moveTo(x + c * cell + 0.5, y);
    ctx.lineTo(x + c * cell + 0.5, y + rows * cell);
  }
  for (let r = 1; r < rows; r++) {
    ctx.moveTo(x, y + r * cell + 0.5);
    ctx.lineTo(x + columns * cell, y + r * cell + 0.5);
  }
  ctx.stroke();
}

/** Paints the palette's surface, one texture per block. */
export function drawSurface(
  ctx: CanvasRenderingContext2D,
  palette: Palette,
  faces: Map<string, HTMLCanvasElement>,
  options: DrawOptions,
) {
  const { columns, rows, cell, x = 0, y = 0, grid = false } = options;
  const face = surfaceFace(palette);
  ctx.imageSmoothingEnabled = false;
  generateGrid(palette, columns, rows).forEach((row, r) =>
    row.forEach((id, c) => {
      const px = x + c * cell;
      const py = y + r * cell;
      const texture = faces.get(`${id}:${face}`);
      if (texture) {
        ctx.drawImage(texture, px, py, cell, cell);
        return;
      }
      ctx.fillStyle = getBlock(id)?.faces[face].color ?? "#444";
      ctx.fillRect(px, py, cell, cell);
    }),
  );
  if (!grid) return;
  if (cell >= 8) drawGrid(ctx, options);
  if (palette.mode === "fixed") {
    // Outline one tile so the repeating unit stays readable.
    ctx.strokeStyle = TILE_OUTLINE;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(
      x + 0.5,
      y + 0.5,
      palette.tile.width * cell - 1,
      palette.tile.height * cell - 1,
    );
    ctx.setLineDash([]);
  }
}
