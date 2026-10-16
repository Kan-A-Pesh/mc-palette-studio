import type { Palette } from "@repo/palette-core";

/** What every tile tool needs: the palette and the active brush. */
export interface TileToolProps {
  palette: Palette;
  brush: string;
}
