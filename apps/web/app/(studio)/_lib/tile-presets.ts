import { cellRandom, pickWeighted, type Palette } from "@repo/palette-core";

interface TilePreset {
  label: string;
  cells: (string | null)[];
}

/** Quick motifs built from the palette's own blocks. */
export function tilePresets(palette: Palette): TilePreset[] {
  const { width, height } = palette.tile;
  const ids = palette.entries.map((e) => e.blockId);
  const accent = ids.find((id) => id !== palette.mainBlockId) ?? null;
  const build = (cell: (x: number, y: number) => string | null) =>
    Array.from({ length: width * height }, (_, i) => {
      const id = cell(i % width, Math.floor(i / width));
      return id === palette.mainBlockId ? null : id;
    });
  return [
    { label: "Damier", cells: build((x, y) => ((x + y) % 2 ? accent : null)) },
    { label: "Bandes", cells: build((_x, y) => ids[y % ids.length] ?? null) },
    {
      label: "Cadre",
      cells: build((x, y) =>
        x === 0 || y === 0 || x === width - 1 || y === height - 1
          ? accent
          : null,
      ),
    },
    {
      label: "Depuis les poids",
      cells: build((x, y) =>
        pickWeighted(palette.entries, cellRandom(x, y, palette.seed)),
      ),
    },
  ];
}
