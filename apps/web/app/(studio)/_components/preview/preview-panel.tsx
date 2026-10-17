"use client";

import { useStudio } from "../../_lib/studio-store";
import { useActivePalette } from "../../_lib/use-active-palette";
import CompositionBar from "./composition-bar";
import { Preview3dLoader } from "./preview-3d-loader";
import PreviewToolbar from "./preview-toolbar";

export default function PreviewPanel() {
  const palette = useActivePalette();
  const previewMode = useStudio((s) => s.previewMode);
  const projection = useStudio((s) => s.projection);
  const previewSize = useStudio((s) => s.previewSize);
  const showGrid = useStudio((s) => s.showGrid);

  return (
    <main className="flex min-h-0 min-w-0 flex-col bg-studio-canvas">
      <PreviewToolbar palette={palette} />
      <div className="relative min-h-0 flex-1 p-6">
        <Preview3dLoader
          palette={palette}
          size={previewSize}
          view={previewMode === "2d" ? "top" : projection}
          grid={showGrid}
        />
      </div>
      <CompositionBar palette={palette} />
    </main>
  );
}
