import type { Metadata } from "next";
import { SITE } from "@/lib/site";

/** Site-wide share fields; pages overriding `openGraph` must spread these. */
export const OPEN_GRAPH = {
  type: "website",
  url: "/",
  siteName: SITE.NAME,
  locale: "en_US",
  title: SITE.TITLE,
  description: SITE.SHARE_DESCRIPTION,
} satisfies Metadata["openGraph"];

export const TWITTER = {
  card: "summary_large_image",
  title: SITE.TITLE,
  description: SITE.SHARE_DESCRIPTION,
} satisfies Metadata["twitter"];
