import type { Metadata } from "next";
import Studio from "./_components/studio";

export const metadata: Metadata = {
  title: "Palette Studio — Minecraft block palettes",
  description:
    "Build Minecraft block palettes with variations, patterns and WorldEdit export.",
};

export default function HomePage() {
  return <Studio />;
}
