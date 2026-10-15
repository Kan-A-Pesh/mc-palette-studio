/** `mossy_stone_bricks` → `Mossy stone bricks`, matching the in-game wording. */
export function displayName(id: string): string {
  const words = id.split("_").join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}
