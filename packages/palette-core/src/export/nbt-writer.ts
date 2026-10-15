import { NBT_TAG } from "./export-constants";

/** Minimal big-endian NBT writer covering the tags a schematic needs. */
export class NbtWriter {
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
    encoded.forEach((b) => this.u8(b));
  }
  private header(type: number, name: string) {
    this.u8(type);
    this.str(name);
  }

  short(name: string, v: number) {
    this.header(NBT_TAG.short, name);
    this.i16(v);
  }
  int(name: string, v: number) {
    this.header(NBT_TAG.int, name);
    this.i32(v);
  }
  /** Int arrays store 4-byte items, byte arrays 1-byte items. */
  array(name: string, kind: "int" | "byte", values: number[]) {
    this.header(kind === "int" ? NBT_TAG.intArray : NBT_TAG.byteArray, name);
    this.i32(values.length);
    const write = kind === "int" ? this.i32.bind(this) : this.u8.bind(this);
    values.forEach(write);
  }
  beginCompound(name: string) {
    this.header(NBT_TAG.compound, name);
  }
  endCompound() {
    this.u8(0);
  }
  toUint8Array() {
    return Uint8Array.from(this.bytes);
  }
}
