/** Four blocks of a palette, drawn as a tiny 2×2 tile. */
export default function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
      <rect x="1" y="1" width="9.5" height="9.5" fill="oklch(62% 0.12 35)" />
      <rect
        x="11.5"
        y="1"
        width="9.5"
        height="9.5"
        fill="oklch(76% 0.15 152)"
      />
      <rect x="1" y="11.5" width="9.5" height="9.5" fill="oklch(52% 0.08 40)" />
      <rect
        x="11.5"
        y="11.5"
        width="9.5"
        height="9.5"
        fill="oklch(70% 0.1 45)"
      />
    </svg>
  );
}
