"use client";

import { useEffect, useRef, useState } from "react";
import type { Palette } from "@repo/palette-core";
import { drawSurface } from "../../_lib/draw/draw-surface";
import { prepareFaces } from "../../_lib/draw/prepare-faces";
import { surfaceRows } from "../../_lib/draw/surface-rows";

interface Preview2dProps {
  palette: Palette;
  columns: number;
  grid: boolean;
}

export default function Preview2d({ palette, columns, grid }: Preview2dProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const rows = surfaceRows(palette, columns);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry)
        setBox({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !box.width || !box.height) return;
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    // Whole device pixels per block keep the 16px textures crisp.
    const cell = Math.max(
      2,
      Math.floor(Math.min(box.width / columns, box.height / rows) * dpr),
    );
    canvas.width = cell * columns;
    canvas.height = cell * rows;
    canvas.style.width = `${canvas.width / dpr}px`;
    canvas.style.height = `${canvas.height / dpr}px`;

    let cancelled = false;
    const draw = (faces: Map<string, HTMLCanvasElement>) =>
      drawSurface(ctx, palette, faces, { columns, rows, cell, grid });
    // Average colours first, textures as soon as they are loaded.
    draw(new Map());
    prepareFaces(palette).then((faces) => {
      if (!cancelled) draw(faces);
    });
    return () => {
      cancelled = true;
    };
  }, [palette, columns, rows, grid, box]);

  return (
    <div ref={containerRef} className="grid h-full w-full place-items-center">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`${palette.surface === "floor" ? "Floor" : "Wall"} preview: ${columns} × ${rows} blocks`}
        className="pixelated shadow-st-canvas"
      />
    </div>
  );
}
