"use client";

import { Eraser } from "lucide-react";
import { getBlock } from "@repo/palette-core";
import { cn } from "@repo/ui/utils/cn";
import { useStudio } from "../../_lib/studio-store";
import BlockTexture from "../shared/block-texture";
import type { TileToolProps } from "./tile-types";

export default function BrushPicker({ palette, brush, face }: TileToolProps) {
  const setBrush = useStudio((s) => s.setBrush);
  const isEraser = brush === palette.mainBlockId;

  return (
    <div
      role="radiogroup"
      aria-label="Brush"
      className="flex flex-wrap gap-1.5"
    >
      {palette.entries
        .filter((e) => e.blockId !== palette.mainBlockId)
        .map((entry) => {
          const name = getBlock(entry.blockId)?.name;
          const selected = entry.blockId === brush;
          return (
            <button
              key={entry.blockId}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`Brush: ${name}`}
              title={name}
              onClick={() => setBrush(entry.blockId)}
              className={cn(
                "p-1 transition-shadow duration-150 focus-visible:outline-2 focus-visible:outline-studio-accent",
                selected ? "shadow-st-selected" : "hover:bg-studio-raised",
              )}
            >
              <BlockTexture blockId={entry.blockId} face={face} size={28} />
            </button>
          );
        })}
      <button
        type="button"
        role="radio"
        aria-checked={isEraser}
        aria-label="Eraser"
        title="Eraser"
        onClick={() => setBrush(palette.mainBlockId)}
        className={cn(
          "grid size-9 place-items-center text-studio-muted hover:bg-studio-raised hover:text-studio-text focus-visible:outline-2 focus-visible:outline-studio-accent",
          isEraser && "text-studio-text shadow-st-selected",
        )}
      >
        <Eraser className="size-4" />
      </button>
    </div>
  );
}
