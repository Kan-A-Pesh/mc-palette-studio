"use client";

import { useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { useStudio, type PickerPurpose } from "../../_lib/studio-store";
import { useActivePalette } from "../../_lib/use-active-palette";
import BlockBrowser from "../browser/block-browser";
import SectionTitle from "../shared/section-title";
import Segmented from "../shared/segmented";
import StudioButton from "../shared/studio-button";
import MainBlockCard from "./main-block-card";
import TileEditor from "../tile/tile-editor";
import UnavailableNotice from "./unavailable-notice";
import VariationsPanel from "./variations-panel";
import WeightsEditor from "./weights-editor";

export default function PalettePanel() {
  const palette = useActivePalette();
  const setMode = useStudio((s) => s.setMode);
  const picker = useStudio((s) => s.picker);
  const openPicker = useStudio((s) => s.openPicker);
  const panelRef = useRef<HTMLElement>(null);
  const openedFor = useRef<PickerPurpose | null>(null);

  // Closing the picker remounts the palette: focus the button that opened it.
  useEffect(() => {
    if (picker) {
      openedFor.current = picker;
      return;
    }
    const purpose = openedFor.current;
    openedFor.current = null;
    if (!purpose) return;
    panelRef.current
      ?.querySelector<HTMLElement>(`[data-picker-trigger="${purpose}"]`)
      ?.focus();
  }, [picker]);

  if (picker) {
    return (
      <aside
        className="flex min-h-0 flex-col border-l border-studio-line bg-studio-panel"
        aria-label="Blocks"
      >
        <BlockBrowser purpose={picker} />
      </aside>
    );
  }

  return (
    <aside
      ref={panelRef}
      className="studio-scroll flex min-h-0 flex-col gap-6 overflow-y-auto border-l border-studio-line bg-studio-panel p-4"
      aria-label="Palette"
    >
      <MainBlockCard
        blockId={palette.mainBlockId}
        onChange={() => openPicker("main")}
      />
      <UnavailableNotice palette={palette} />
      <VariationsPanel />
      <div className="h-px shrink-0 bg-studio-line" />
      <section className="flex flex-col gap-3" aria-labelledby="pattern-title">
        <SectionTitle
          id="pattern-title"
          aside={
            <StudioButton
              size="sm"
              variant="ghost"
              data-picker-trigger="add"
              onClick={() => openPicker("add")}
            >
              <Plus className="size-3.5" />
              Add block
            </StudioButton>
          }
        >
          Pattern
        </SectionTitle>
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
