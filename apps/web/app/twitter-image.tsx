import { ImageResponse } from "next/og";
import OgCard from "@/lib/og/og-card";
import { ogRows } from "@/lib/og/og-rows";

export const alt = "Palette Studio – Minecraft block palette generator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(<OgCard rows={ogRows} />, size);
}
