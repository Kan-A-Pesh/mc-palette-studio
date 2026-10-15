import { encodeShare, type Palette } from "@repo/palette-core";

/** Link that recreates the palette for whoever opens it. */
export function shareUrl(palette: Palette): string {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("p", encodeShare(palette));
  return url.toString();
}
