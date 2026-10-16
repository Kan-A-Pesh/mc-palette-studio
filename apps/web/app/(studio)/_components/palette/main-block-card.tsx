"use client";

import { getBlock } from "@repo/palette-core";
import BlockTexture from "../shared/block-texture";
import StudioButton from "../shared/studio-button";

interface MainBlockCardProps {
  blockId: string;
  onChange: () => void;
}

export default function MainBlockCard({
  blockId,
  onChange,
}: MainBlockCardProps) {
  return (
    <section className="flex items-center gap-3 bg-studio-canvas p-3 ring-1 ring-studio-line">
      <BlockTexture blockId={blockId} size={48} className="" />
      <div className="min-w-0 flex-1">
        <p className="text-st-xs font-semibold uppercase tracking-st-label text-studio-faint">
          Main block
        </p>
        <p className="truncate text-st-lg font-semibold text-studio-text">
          {getBlock(blockId)?.name}
        </p>
        <p className="truncate font-mono-studio text-xs text-studio-muted">
          minecraft:{blockId}
        </p>
      </div>
      <StudioButton size="sm" data-picker-trigger="main" onClick={onChange}>
        Change
      </StudioButton>
    </section>
  );
}
