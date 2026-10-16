import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.NAME,
    short_name: SITE.NAME,
    description: SITE.SHARE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: SITE.COLORS.CANVAS,
    theme_color: SITE.COLORS.CANVAS,
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
