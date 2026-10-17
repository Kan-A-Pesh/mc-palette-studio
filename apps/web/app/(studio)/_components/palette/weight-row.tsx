"use client";

import { Trash2, TriangleAlert } from "lucide-react";
import { getBlock, type WeightedBlock } from "@repo/palette-core";
import { useStudio } from "../../_lib/studio-store";
import BlockTexture from "../shared/block-texture";
import Range from "../shared/range";

interface WeightRowProps {
  entry: WeightedBlock;
  percent: number;
  isMain: boolean;
  /** Release that added the block, when the palette's release lacks it. */
  missingUntil?: string;
}

export default function WeightRow({
  entry,
  percent,
  isMain,
  missingUntil,
}: WeightRowProps) {
  const setWeight = useStudio((s) => s.setWeight);
  const removeEntry = useStudio((s) => s.removeEntry);
  const name = getBlock(entry.blockId)?.name;

  return (
    <li className="flex items-center gap-2.5 py-1.5 pr-1">
      <BlockTexture blockId={entry.blockId} size={28} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-st-md text-studio-text">
            {name}
            {isMain && (
              <span className="ml-1.5 text-st-xs text-studio-accent">main</span>
            )}
            {missingUntil && (
              <span
                className="ml-1.5 inline-flex items-center gap-0.5 text-st-xs text-studio-danger"
                title={`Added in Java ${missingUntil}`}
              >
                <TriangleAlert className="size-3" aria-hidden />
                {missingUntil}+
              </span>
            )}
          </span>
          <span className="shrink-0 text-xs tabular-nums text-studio-muted">
            {percent}%
          </span>
        </div>
        <Range
          label={`${name} weight`}
          value={entry.weight}
          min={0}
          max={100}
          onChange={(w) => setWeight(entry.blockId, w)}
        />
      </div>
      <button
        type="button"
        aria-label={`Remove ${name}`}
        disabled={isMain}
        onClick={() => removeEntry(entry.blockId)}
        className="grid size-7 place-items-center text-studio-faint transition-colors duration-150 hover:bg-studio-raised hover:text-studio-danger focus-visible:outline-2 focus-visible:outline-studio-accent disabled:invisible"
      >
        <Trash2 className="size-3.5" />
      </button>
    </li>
  );
}
