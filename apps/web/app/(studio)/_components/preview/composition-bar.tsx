"use client";

import {
  getBlock,
  tileUsage,
  toPercentages,
  type Palette,
} from "@repo/palette-core";

/** Share of each block in the pattern, as a bar and a legend. */
export default function CompositionBar({ palette }: { palette: Palette }) {
  const composition = toPercentages(
    palette.mode === "fixed" ? tileUsage(palette) : palette.entries,
  );
  const colorOf = (id: string) => getBlock(id)?.faces.side.color;

  return (
    <div className="flex flex-col gap-2 border-t border-studio-line px-4 py-3">
      <div className="flex h-2 overflow-hidden rounded-full" aria-hidden>
        {composition.map((e) => (
          <span
            key={e.blockId}
            style={{ width: `${e.weight}%`, background: colorOf(e.blockId) }}
          />
        ))}
      </div>
      <ul
        className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-studio-muted"
        aria-label="Composition"
      >
        {composition.map((e) => (
          <li key={e.blockId} className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ background: colorOf(e.blockId) }}
            />
            {getBlock(e.blockId)?.name}
            <span className="tabular-nums text-studio-faint">{e.weight}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
