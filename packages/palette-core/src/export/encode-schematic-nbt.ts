import { SCHEMATIC_DATA_VERSION } from "./export-constants";
import { NbtWriter } from "./nbt-writer";
import type { SchematicLayout } from "./tile-layout";

function varint(value: number, out: number[]) {
  let v = value;
  while ((v & ~0x7f) !== 0) {
    out.push((v & 0x7f) | 0x80);
    v >>>= 7;
  }
  out.push(v);
}

/** Uncompressed NBT of a Sponge schematic v2. */
export function encodeSchematicNbt(layout: SchematicLayout): Uint8Array {
  const palette = new Map<string, number>();
  const data: number[] = [];
  for (let y = 0; y < layout.height; y++) {
    for (let z = 0; z < layout.length; z++) {
      for (let x = 0; x < layout.width; x++) {
        const id = `minecraft:${layout.blockAt(x, y, z)}`;
        const index = palette.get(id) ?? palette.size;
        palette.set(id, index);
        varint(index, data);
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
  nbt.array("Offset", "int", [0, 0, 0]);
  nbt.int("PaletteMax", palette.size);
  nbt.beginCompound("Palette");
  palette.forEach((index, id) => nbt.int(id, index));
  nbt.endCompound();
  nbt.array("BlockData", "byte", data);
  nbt.endCompound();
  return nbt.toUint8Array();
}
