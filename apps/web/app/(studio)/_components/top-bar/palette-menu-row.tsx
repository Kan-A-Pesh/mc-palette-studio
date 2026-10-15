"use client";

import { useState } from "react";
import { Copy, Trash2 } from "lucide-react";
import { getBlock, type Palette } from "@repo/palette-core";
import { cn } from "@repo/ui/utils/cn";
import { useStudio } from "../../_lib/studio-store";
import BlockTexture from "../shared/block-texture";

interface PaletteMenuRowProps {
  palette: Palette;
  active: boolean;
  onDone: () => void;
}

export default function PaletteMenuRow({
  palette,
  active,
  onDone,
}: PaletteMenuRowProps) {
  const selectPalette = useStudio((s) => s.selectPalette);
  const duplicatePalette = useStudio((s) => s.duplicatePalette);
  const deletePalette = useStudio((s) => s.deletePalette);
  const [confirming, setConfirming] = useState(false);

  return (
    <li
      className="group flex items-center hover:bg-studio-raised"
      onPointerLeave={() => setConfirming(false)}
    >
      <button
        type="button"
        onClick={() => {
          selectPalette(palette.id);
          onDone();
        }}
        className="flex min-w-0 flex-1 items-center gap-2.5 px-2 py-2 text-left focus-visible:outline-2 focus-visible:outline-studio-accent"
      >
        <span className="flex -space-x-1.5">
          {palette.entries.slice(0, 4).map((e) => (
            <BlockTexture
              key={e.blockId}
              blockId={e.blockId}
              size={22}
              className="ring-2 ring-studio-panel"
            />
          ))}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block truncate text-sm text-studio-text",
              active && "font-semibold",
            )}
          >
            {palette.name}
          </span>
          <span className="block truncate text-xs text-studio-faint">
            {getBlock(palette.mainBlockId)?.name} ·{" "}
            {palette.mode === "fixed" ? "tile" : "random"}
          </span>
        </span>
      </button>
      <button
        type="button"
        aria-label={`Duplicate ${palette.name}`}
        title="Duplicate"
        onClick={() => {
          duplicatePalette(palette.id);
          onDone();
        }}
        className="grid size-7 place-items-center text-studio-faint opacity-0 hover:text-studio-text focus-visible:opacity-100 group-hover:opacity-100"
      >
        <Copy className="size-3.5" />
      </button>
      <button
        type="button"
        aria-label={
          confirming
            ? `Confirm delete ${palette.name}`
            : `Delete ${palette.name}`
        }
        title="Delete"
        onClick={() =>
          confirming ? deletePalette(palette.id) : setConfirming(true)
        }
        className={cn(
          "mr-1 grid h-7 place-items-center px-1.5 text-xs focus-visible:opacity-100",
          confirming
            ? "bg-studio-danger/15 text-studio-danger"
            : "text-studio-faint opacity-0 hover:text-studio-danger group-hover:opacity-100",
        )}
      >
        {confirming ? "Delete?" : <Trash2 className="size-3.5" />}
      </button>
    </li>
  );
}
