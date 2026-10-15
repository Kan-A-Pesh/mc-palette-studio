"use client";

import { tileUsage, type Palette } from "@repo/palette-core";
import { surfaceFace } from "../../_lib/draw/surface-face";
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

  const face = surfaceFace(palette);
  const { width, height, cells } = palette.tile;
  const valid = brushId && palette.entries.some((e) => e.blockId === brushId);
  const brush = valid
    ? brushId
    : (palette.entries.find((e) => e.blockId !== palette.mainBlockId)
        ?.blockId ?? palette.mainBlockId);
  const usage = new Map(tileUsage(palette).map((u) => [u.blockId, u.weight]));

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-studio-muted">
        Peins la tuile : elle se répète sur toute la surface. Clic droit pour
        remettre le bloc principal.
      </p>
      <BrushPicker palette={palette} brush={brush} face={face} usage={usage} />
      <TileGrid palette={palette} brush={brush} face={face} />
      <div className="grid grid-cols-2 gap-3">
        <SizeStepper
          label="Largeur"
          value={width}
          onChange={(w) => resizeTile(w, height)}
        />
        <SizeStepper
          label="Hauteur"
          value={height}
          onChange={(h) => resizeTile(width, h)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-studio-muted">Motifs rapides</span>
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
            Vider
          </StudioButton>
        </div>
      </div>
    </div>
  );
}
