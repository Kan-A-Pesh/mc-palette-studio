import type { Palette } from "../pattern";
import { SCHEMATIC_FILE_NAME } from "./export-constants";
import { worldEditPattern } from "./world-edit-pattern";

export interface WorldEditCommand {
  label: string;
  command: string;
  hint: string;
}

export function worldEditCommands(palette: Palette): WorldEditCommand[] {
  if (palette.mode === "fixed") {
    return [
      {
        label: "Charger la tuile",
        command: `//schem load ${SCHEMATIC_FILE_NAME}`,
        hint: "Après avoir déposé le .schem dans plugins/WorldEdit/schematics (ou config/worldedit/schematics).",
      },
      {
        label: "Répéter la tuile sur la sélection",
        command: "//set #clipboard",
        hint: "Le motif du presse-papiers est répété à l'identique sur toute la sélection.",
      },
      {
        label: "Remplacer uniquement le bloc principal",
        command: `//replace ${palette.mainBlockId} #clipboard`,
        hint: "Applique le motif seulement là où se trouve déjà le bloc principal.",
      },
    ];
  }
  const pattern = worldEditPattern(palette);
  return [
    {
      label: "Remplir la sélection",
      command: `//set ${pattern}`,
      hint: "Remplit toute la sélection avec le mélange aléatoire.",
    },
    {
      label: "Remplacer le bloc principal",
      command: `//replace ${palette.mainBlockId} ${pattern}`,
      hint: "Pose ton build en bloc principal, puis ajoute les variations d'un coup.",
    },
    {
      label: "Pinceau",
      command: `/brush sphere ${pattern} 3`,
      hint: "Peins le mélange à la main avec un outil en main.",
    },
  ];
}
