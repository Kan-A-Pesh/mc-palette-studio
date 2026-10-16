"use client";

import type { Palette } from "@repo/palette-core";
import { useStudio } from "../../_lib/studio-store";
import { tilePresets } from "../../_lib/tile-presets";
import StudioButton from "../shared/studio-button";
import BrushPicker from "./brush-picker";
import SizeStepper from "./size-stepper";
import TileGrid from "./tile-grid";

export default function TileEditor({ palette }: { palette: Palette }) {
  const brushId = useStudio((s) => s.brushId);
  const resizeTile = useStudio((s) => s.resizeTile);
  const fillTile = useStudio((s) => s.fillTile);

  const { width, height, cells } = palette.tile;
  const valid = brushId && palette.entries.some((e) => e.blockId === brushId);
  const brush = valid
    ? brushId
    : (palette.entries.find((e) => e.blockId !== palette.mainBlockId)
        ?.blockId ?? palette.mainBlockId);

  return (
    <div className="flex flex-col gap-3">
      <BrushPicker palette={palette} brush={brush} />
      <TileGrid palette={palette} brush={brush} />
      <div className="grid grid-cols-2 gap-3">
        <SizeStepper
          label="Width"
          value={width}
          onChange={(w) => resizeTile(w, height)}
        />
        <SizeStepper
          label="Height"
          value={height}
          onChange={(h) => resizeTile(width, h)}
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tilePresets(palette).map((preset) => (
          <StudioButton
            key={preset.label}
            size="sm"
            onClick={() => fillTile(preset.cells)}
          >
            {preset.label}
          </StudioButton>
        ))}
        <StudioButton
          size="sm"
          variant="ghost"
          onClick={() => fillTile(cells.map(() => null))}
        >
          Clear
        </StudioButton>
      </div>
    </div>
  );
}
