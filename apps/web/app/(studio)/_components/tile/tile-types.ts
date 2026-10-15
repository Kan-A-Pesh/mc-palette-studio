import type { FaceName, Palette } from "@repo/palette-core";

/** What every tile tool needs: the palette, the active brush and the face shown. */
export interface TileToolProps {
  palette: Palette;
  brush: string;
  face: FaceName;
}
