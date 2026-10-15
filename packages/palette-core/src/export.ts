import { tileUsage, toPercentages, type Palette, type Tile } from "./pattern";

export const SCHEMATIC_FILE_NAME = "palette_tile";

/** WorldEdit pattern syntax: `50%bricks,30%granite,20%mud_bricks`. */
export function worldEditPattern(palette: Palette): string {
  const entries = palette.mode === "fixed" ? tileUsage(palette) : palette.entries;
  const percentages = toPercentages(entries);
  if (percentages.length === 1) return percentages[0]!.blockId;
  return percentages.map((e) => `${e.weight}%${e.blockId}`).join(",");
}

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

// ---------------------------------------------------------------------------
// Sponge schematic v2 (.schem), readable by WorldEdit and FAWE.
// ---------------------------------------------------------------------------

/** Data version of 1.21.4: newer servers upgrade it, older blocks are unchanged. */
export const SCHEMATIC_DATA_VERSION = 4189;

const TAG = { byte: 1, short: 2, int: 4, byteArray: 7, string: 8, compound: 10, intArray: 11 } as const;

class NbtWriter {
  private bytes: number[] = [];

  private u8(v: number) {
    this.bytes.push(v & 0xff);
  }
  private i16(v: number) {
    this.u8(v >> 8);
    this.u8(v);
  }
  private i32(v: number) {
    this.u8(v >>> 24);
    this.u8(v >>> 16);
    this.u8(v >>> 8);
    this.u8(v);
  }
  private str(s: string) {
    const encoded = new TextEncoder().encode(s);
    this.i16(encoded.length);
    for (const b of encoded) this.u8(b);
  }
  private header(type: number, name: string) {
    this.u8(type);
    this.str(name);
  }

  short(name: string, v: number) {
    this.header(TAG.short, name);
    this.i16(v);
  }
  int(name: string, v: number) {
    this.header(TAG.int, name);
    this.i32(v);
  }
  intArray(name: string, values: number[]) {
    this.header(TAG.intArray, name);
    this.i32(values.length);
    values.forEach((v) => this.i32(v));
  }
  byteArray(name: string, values: number[]) {
    this.header(TAG.byteArray, name);
    this.i32(values.length);
    values.forEach((v) => this.u8(v));
  }
  beginCompound(name: string) {
    this.header(TAG.compound, name);
  }
  endCompound() {
    this.u8(0);
  }
  toUint8Array() {
    return Uint8Array.from(this.bytes);
  }
}

function varint(value: number, out: number[]) {
  let v = value;
  while ((v & ~0x7f) !== 0) {
    out.push((v & 0x7f) | 0x80);
    v >>>= 7;
  }
  out.push(v);
}

export interface SchematicLayout {
  width: number;
  height: number;
  length: number;
  /** Block id at schematic coordinates. */
  blockAt: (x: number, y: number, z: number) => string;
}

export function tileLayout(tile: Tile, mainBlockId: string, surface: Palette["surface"]): SchematicLayout {
  const cell = (cx: number, cy: number) => tile.cells[cy * tile.width + cx] ?? mainBlockId;
  return surface === "floor"
    ? { width: tile.width, height: 1, length: tile.height, blockAt: (x, _y, z) => cell(x, z) }
    : // Wall rows are drawn top-down, schematic Y grows upward.
      { width: tile.width, height: tile.height, length: 1, blockAt: (x, y) => cell(x, tile.height - 1 - y) };
}

/** Uncompressed NBT of a Sponge schematic v2. */
export function encodeSchematicNbt(layout: SchematicLayout): Uint8Array {
  const palette = new Map<string, number>();
  const data: number[] = [];
  for (let y = 0; y < layout.height; y++) {
    for (let z = 0; z < layout.length; z++) {
      for (let x = 0; x < layout.width; x++) {
        const id = `minecraft:${layout.blockAt(x, y, z)}`;
        if (!palette.has(id)) palette.set(id, palette.size);
        varint(palette.get(id)!, data);
      }
    }
  }

  const nbt = new NbtWriter();
  nbt.beginCompound("Schematic");
  nbt.int("Version", 2);
  nbt.int("DataVersion", SCHEMATIC_DATA_VERSION);
  nbt.short("Width", layout.width);
  nbt.short("Height", layout.height);
  nbt.short("Length", layout.length);
  nbt.intArray("Offset", [0, 0, 0]);
  nbt.int("PaletteMax", palette.size);
  nbt.beginCompound("Palette");
  for (const [id, index] of palette) nbt.int(id, index);
  nbt.endCompound();
  nbt.byteArray("BlockData", data);
  nbt.endCompound();
  return nbt.toUint8Array();
}

/** Gzipped `.schem` file for the fixed tile of a palette. */
export async function encodeSchematic(palette: Palette): Promise<Uint8Array> {
  const raw = encodeSchematicNbt(tileLayout(palette.tile, palette.mainBlockId, palette.surface));
  const stream = new Blob([raw as BlobPart]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
