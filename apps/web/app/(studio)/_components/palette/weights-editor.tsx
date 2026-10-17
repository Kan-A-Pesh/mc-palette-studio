"use client";

import {
  toPercentages,
  unavailableBlocks,
  type Palette,
} from "@repo/palette-core";
import WeightRow from "./weight-row";

export default function WeightsEditor({ palette }: { palette: Palette }) {
  const percentages = new Map(
    toPercentages(palette.entries).map((e) => [e.blockId, e.weight]),
  );
  const missing = new Map(
    unavailableBlocks(palette).map((b) => [b.id, b.since]),
  );

  return (
    <div className="flex flex-col gap-1">
      <ul className="flex flex-col">
        {palette.entries.map((entry) => (
          <WeightRow
            key={entry.blockId}
            entry={entry}
            percent={percentages.get(entry.blockId) ?? 0}
            isMain={entry.blockId === palette.mainBlockId}
            missingUntil={missing.get(entry.blockId)}
          />
        ))}
      </ul>
      {palette.entries.length < 2 && (
        <p className="bg-studio-canvas px-3 py-3 text-xs text-studio-muted">
          Add blocks to build a mix.
        </p>
      )}
    </div>
  );
}
