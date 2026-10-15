"use client";

import { useStudio } from "../../_lib/studio-store";
import { useActivePalette } from "../../_lib/use-active-palette";
import SectionTitle from "../shared/section-title";
import Segmented from "../shared/segmented";
import MainBlockCard from "./main-block-card";
import TileEditor from "../tile/tile-editor";
import VariationsPanel from "./variations-panel";
import WeightsEditor from "./weights-editor";

export default function PalettePanel() {
  const palette = useActivePalette();
  const setMode = useStudio((s) => s.setMode);

  return (
    <aside
      className="studio-scroll flex min-h-0 flex-col gap-6 overflow-y-auto border-l border-studio-line bg-studio-panel p-4"
      aria-label="Palette"
    >
      <MainBlockCard blockId={palette.mainBlockId} />
      <VariationsPanel />
      <div className="h-px shrink-0 bg-studio-line" />
      <section className="flex flex-col gap-3" aria-labelledby="pattern-title">
        <SectionTitle id="pattern-title">Pattern</SectionTitle>
        <Segmented
          label="Pattern type"
          value={palette.mode}
          onChange={setMode}
          className="w-full"
          options={[
            {
              value: "random",
              label: "Random",
            },
            {
              value: "fixed",
              label: "Tile",
            },
          ]}
        />
        {palette.mode === "random" ? (
          <WeightsEditor palette={palette} />
        ) : (
          <TileEditor palette={palette} />
        )}
      </section>
    </aside>
  );
}
