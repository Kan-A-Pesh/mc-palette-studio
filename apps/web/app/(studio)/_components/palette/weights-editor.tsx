"use client";

import { toPercentages, type Palette } from "@repo/palette-core";
import WeightRow from "./weight-row";

export default function WeightsEditor({ palette }: { palette: Palette }) {
  const percentages = new Map(
    toPercentages(palette.entries).map((e) => [e.blockId, e.weight]),
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
