"use client";

import { PREVIEW_3D_MAX_SIZE } from "../../_lib/studio-constants";
import { useStudio } from "../../_lib/studio-store";
import { useActivePalette } from "../../_lib/use-active-palette";
import CompositionBar from "./composition-bar";
import Preview2d from "./preview-2d";
import { Preview3dLoader } from "./preview-3d-loader";
import PreviewToolbar from "./preview-toolbar";

export default function PreviewPanel() {
  const palette = useActivePalette();
  const previewMode = useStudio((s) => s.previewMode);
  const previewSize = useStudio((s) => s.previewSize);
  const showGrid = useStudio((s) => s.showGrid);

  return (
    <main className="flex min-h-0 min-w-0 flex-col bg-studio-canvas">
      <PreviewToolbar palette={palette} />
      <div className="relative min-h-0 flex-1 p-6">
        {previewMode === "2d" ? (
          <Preview2d palette={palette} columns={previewSize} grid={showGrid} />
        ) : (
          <Preview3dLoader
            palette={palette}
            size={Math.min(previewSize, PREVIEW_3D_MAX_SIZE)}
          />
        )}
      </div>
      <CompositionBar palette={palette} />
    </main>
  );
}
