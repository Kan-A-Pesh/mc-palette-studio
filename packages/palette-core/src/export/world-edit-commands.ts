import type { Palette } from "../pattern";
import { SCHEMATIC_FILE_NAME } from "./export-constants";
import { worldEditPattern } from "./world-edit-pattern";

export interface WorldEditCommand {
  label: string;
  command: string;
}

export function worldEditCommands(palette: Palette): WorldEditCommand[] {
  if (palette.mode === "fixed") {
    return [
      { label: "Load tile", command: `//schem load ${SCHEMATIC_FILE_NAME}` },
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
