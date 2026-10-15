"use client";

import { useEffect, useState } from "react";
import { decodeShare } from "@repo/palette-core";
import { toast } from "@repo/ui/toast";
import { useStudio } from "../_lib/studio-store";
import BlockBrowser from "./browser/block-browser";
import PalettePanel from "./palette/palette-panel";
import PreviewPanel from "./preview/preview-panel";
import TopBar from "./top-bar/top-bar";

export default function Studio() {
  // Palettes live in localStorage: render only once the client store is ready.
  const [ready, setReady] = useState(false);
  const importPalette = useStudio((s) => s.importPalette);

  useEffect(() => {
    const url = new URL(window.location.href);
    const shared = url.searchParams.get("p");
    if (shared) {
      const palette = decodeShare(shared);
      if (palette) {
        importPalette(palette);
        toast.success(`Palette « ${palette.name} » ajoutée à tes palettes.`);
      } else {
        toast.error("Ce lien de partage est invalide ou incomplet.");
      }
      url.searchParams.delete("p");
      window.history.replaceState(null, "", url.toString());
    }
    setReady(true);
  }, [importPalette]);

  return (
    <div className="studio-root dark flex h-dvh flex-col bg-studio-canvas text-studio-text">
      {ready ? (
        <>
          <TopBar />
          <div className="studio-layout grid min-h-0 flex-1">
            <BlockBrowser />
            <PreviewPanel />
            <PalettePanel />
          </div>
        </>
      ) : (
        <div className="grid flex-1 place-items-center text-sm text-studio-muted">
          Chargement de tes palettes…
        </div>
      )}
    </div>
  );
}
