import type { Metadata } from "next";
import Studio from "./_components/studio";

export const metadata: Metadata = {
  title: "Palette Studio — palettes de blocs Minecraft",
  description:
    "Choisis un bloc principal, récupère ses variations, compose des patterns fixes ou aléatoires et exporte-les pour WorldEdit.",
};

export default function HomePage() {
  return <Studio />;
}
