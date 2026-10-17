/** Height of the walls drawn for a preview `size` blocks wide. */
export function wallHeight(size: number): number {
  return Math.max(4, Math.round(size * 0.56));
}
