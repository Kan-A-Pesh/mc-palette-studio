import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Template pages stay crawlable so engines can read their `noindex` tag.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${SITE.URL}/sitemap.xml`,
    host: SITE.URL,
  };
}
