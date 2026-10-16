"use client";

import { ChevronDown } from "lucide-react";
import { MC_VERSIONS } from "@repo/palette-core";
import { useStudio } from "../../_lib/studio-store";
import { useActivePalette } from "../../_lib/use-active-palette";

/** Java release the palette targets: it decides which blocks are offered. */
export default function VersionSelect() {
  const palette = useActivePalette();
  const setVersion = useStudio((s) => s.setVersion);

  return (
    <label className="relative flex items-center">
      <span className="sr-only">Minecraft Java version</span>
      <select
        value={palette.version}
        onChange={(e) => setVersion(e.target.value)}
        className="h-7 appearance-none bg-studio-raised py-0 pl-2 pr-6 text-st-xs tabular-nums text-studio-muted hover:text-studio-text focus-visible:outline-2 focus-visible:outline-studio-accent"
      >
        {MC_VERSIONS.map((v) => (
          <option key={v.id} value={v.id}>
            Java {v.id}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-1.5 size-3.5 text-studio-faint" />
    </label>
  );
}
