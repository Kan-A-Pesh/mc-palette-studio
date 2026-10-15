"use client";

import { toPercentages, type Palette } from "@repo/palette-core";
import { useStudio } from "../../_lib/studio-store";
import StudioButton from "../shared/studio-button";
import WeightRow from "./weight-row";

export default function WeightsEditor({ palette }: { palette: Palette }) {
  const reseed = useStudio((s) => s.reseed);
  const percentages = new Map(
    toPercentages(palette.entries).map((e) => [e.blockId, e.weight]),
  );

  return (
    <div className="flex flex-col gap-1">
      <p className="mb-1 text-xs text-studio-muted">
        Chaque bloc apparaît au hasard selon sa proportion.
      </p>
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
        <p className="rounded-lg bg-studio-canvas px-3 py-3 text-xs text-studio-muted">
          Ajoute des variations ci-dessus ou avec le « + » d’un bloc pour
          composer ton mélange.
        </p>
      )}
      <StudioButton
        size="sm"
        variant="ghost"
        className="mt-1 self-start"
        onClick={reseed}
      >
        ↻ Nouveau tirage
      </StudioButton>
    </div>
  );
}
