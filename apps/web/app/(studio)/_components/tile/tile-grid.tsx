"use client";

import { useRef } from "react";
import { getBlock } from "@repo/palette-core";
import { useStudio } from "../../_lib/studio-store";
import BlockTexture from "../shared/block-texture";
import type { TileToolProps } from "./tile-types";

/** Click or drag to paint; right click paints the main block back. */
export default function TileGrid({ palette, brush, face }: TileToolProps) {
  const paintCell = useStudio((s) => s.paintCell);
  // `undefined` = not painting; `null` = painting the main block back.
  const painting = useRef<string | null | undefined>(undefined);
  const { width, cells } = palette.tile;
  const stop = () => (painting.current = undefined);

  return (
    <div
      className="mx-auto grid w-full max-w-65 select-none gap-px rounded-lg bg-studio-line p-px"
      style={{ gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))` }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onContextMenu={(e) => e.preventDefault()}
    >
      {cells.map((cell, index) => {
        const id = cell ?? palette.mainBlockId;
        return (
          <button
            key={index}
            type="button"
            aria-label={`Case ${(index % width) + 1}, ${Math.floor(index / width) + 1} : ${getBlock(id)?.name}`}
            onPointerDown={(e) => {
              e.preventDefault();
              painting.current = e.button === 2 ? null : brush;
              paintCell(index, painting.current);
            }}
            onPointerEnter={() => {
              if (painting.current !== undefined)
                paintCell(index, painting.current);
            }}
            onKeyDown={(e) => {
              if (e.key !== "Enter" && e.key !== " ") return;
              e.preventDefault();
              paintCell(index, brush);
            }}
            className="aspect-square overflow-hidden focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-studio-accent"
          >
            <BlockTexture
              blockId={id}
              face={face}
              size={64}
              className="h-full! w-full! rounded-none outline-0"
            />
          </button>
        );
      })}
    </div>
  );
}
