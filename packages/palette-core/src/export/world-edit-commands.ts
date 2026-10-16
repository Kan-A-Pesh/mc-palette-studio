import type { Palette, Surface } from "../pattern";
import { SCHEMATIC_FILE_NAMES } from "./export-constants";
import { worldEditPattern } from "./world-edit-pattern";

export interface WorldEditCommand {
  label: string;
  command: string;
}

/** `surface` picks the schematic a fixed tile is loaded from. */
export function worldEditCommands(
  palette: Palette,
  surface: Surface,
): WorldEditCommand[] {
  if (palette.mode === "fixed") {
    return [
      {
        label: "Load tile",
        command: `//schem load ${SCHEMATIC_FILE_NAMES[surface]}`,
      },
      { label: "Fill selection", command: "//set #clipboard" },
      {
        label: "Replace main block",
        command: `//replace ${palette.mainBlockId} #clipboard`,
      },
    ];
  }
  const pattern = worldEditPattern(palette);
  return [
    { label: "Fill selection", command: `//set ${pattern}` },
    {
      label: "Replace main block",
      command: `//replace ${palette.mainBlockId} ${pattern}`,
    },
    { label: "Brush", command: `/brush sphere ${pattern} 3` },
  ];
}
