/**
 * Compact, versioned payload stored in the share link. Short keys keep URLs
 * reasonable; ids and timestamps are regenerated on import.
 */
export interface SharePayloadV1 {
  v: 1;
  n: string;
  m: string;
  e: [string, number][];
  k: "r" | "f";
  s: "w" | "f";
  d: number;
  t: [number, number, (string | 0)[]];
}
