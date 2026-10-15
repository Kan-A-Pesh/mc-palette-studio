"use client";

import { getBlock } from "@repo/palette-core";
import BlockTexture from "../shared/block-texture";

export default function MainBlockCard({ blockId }: { blockId: string }) {
  return (
    <section className="flex items-center gap-3 rounded-xl bg-studio-canvas p-3 ring-1 ring-studio-line">
      <BlockTexture blockId={blockId} size={48} className="rounded-md" />
      <div className="min-w-0">
        <p className="text-st-xs font-semibold uppercase tracking-st-label text-studio-faint">
          Bloc principal
        </p>
        <p className="truncate text-st-lg font-semibold text-studio-text">
          {getBlock(blockId)?.name}
        </p>
        <p className="truncate font-mono-studio text-xs text-studio-muted">
          minecraft:{blockId}
        </p>
      </div>
    </section>
  );
}
