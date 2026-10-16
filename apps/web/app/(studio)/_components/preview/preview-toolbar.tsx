"use client";

import { Grid3x3, RefreshCw } from "lucide-react";
import type { Palette } from "@repo/palette-core";
import { cn } from "@repo/ui/utils/cn";
import { PREVIEW_SIZE } from "../../_lib/studio-constants";
import { useStudio } from "../../_lib/studio-store";
import Range from "../shared/range";
import Segmented from "../shared/segmented";
import StudioButton from "../shared/studio-button";

export default function PreviewToolbar({ palette }: { palette: Palette }) {
  const previewMode = useStudio((s) => s.previewMode);
  const setPreviewMode = useStudio((s) => s.setPreviewMode);
  const previewSize = useStudio((s) => s.previewSize);
  const setPreviewSize = useStudio((s) => s.setPreviewSize);
  const showGrid = useStudio((s) => s.showGrid);
  const setShowGrid = useStudio((s) => s.setShowGrid);
  const projection = useStudio((s) => s.projection);
  const setProjection = useStudio((s) => s.setProjection);
  const reseed = useStudio((s) => s.reseed);

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-studio-line px-4 py-2.5">
      <Segmented
        label="Preview mode"
        value={previewMode}
        onChange={setPreviewMode}
        options={[
          { value: "2d", label: "2D", title: "Top-down, orthographic" },
          { value: "3d", label: "3D", title: "Free camera" },
        ]}
      />
      {previewMode === "3d" && (
        <Segmented
          label="Projection"
          value={projection}
          onChange={setProjection}
          options={[
            { value: "perspective", label: "Perspective" },
            { value: "orthographic", label: "Orthographic" },
          ]}
        />
      )}
      <div className="ml-auto flex items-center gap-2">
        <label className="flex items-center gap-2 text-xs text-studio-muted">
          <span className="whitespace-nowrap">Size</span>
          <Range
            label="Preview size"
            value={previewSize}
            min={PREVIEW_SIZE.min}
            max={PREVIEW_SIZE.max}
            onChange={setPreviewSize}
            className="w-28"
          />
          <span className="w-6 tabular-nums">{previewSize}</span>
        </label>
        <button
          type="button"
          aria-pressed={showGrid}
          aria-label="Show grid"
          title="Grid"
          onClick={() => setShowGrid(!showGrid)}
          className={cn(
            "grid size-8 place-items-center transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-studio-accent",
            showGrid
              ? "bg-studio-raised text-studio-text"
              : "text-studio-muted hover:text-studio-text",
          )}
        >
          <Grid3x3 className="size-4" />
        </button>
        {palette.mode === "random" && (
          <StudioButton
            size="sm"
            variant="ghost"
            onClick={reseed}
            title="Reroll"
          >
            <RefreshCw className="size-3.5" />
            Reroll
          </StudioButton>
        )}
      </div>
    </div>
  );
}
