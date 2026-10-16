"use client";

import { useActivePalette } from "../../_lib/use-active-palette";
import { useStudio } from "../../_lib/studio-store";
import ExportDialog from "../export/export-dialog";
import Logo from "./logo";
import PalettesMenu from "./palettes-menu";
import VersionSelect from "./version-select";

export default function TopBar() {
  const palette = useActivePalette();
  const update = useStudio((s) => s.update);

  return (
    <header className="flex h-14 items-center gap-3 border-b border-studio-line bg-studio-panel px-4">
      <div className="flex items-center gap-2.5 pr-2">
        <Logo />
        <span className="hidden text-sm font-semibold tracking-tight text-studio-text sm:inline">
          Palette Studio
        </span>
        <VersionSelect />
      </div>
      <div className="h-6 w-px bg-studio-line" />
      <label className="min-w-0 max-w-xs flex-1">
        <span className="sr-only">Palette name</span>
        <input
          value={palette.name}
          maxLength={60}
          onChange={(e) => update({ name: e.target.value })}
          onBlur={(e) => !e.target.value.trim() && update({ name: "Untitled" })}
          className="h-9 w-full truncate bg-transparent px-2 text-st-lg font-semibold text-studio-text hover:bg-studio-raised focus:bg-studio-canvas focus:outline-none focus:ring-2 focus:ring-studio-accent"
        />
      </label>
      <PalettesMenu />
      <div className="ml-auto">
        <ExportDialog palette={palette} />
      </div>
    </header>
  );
}
