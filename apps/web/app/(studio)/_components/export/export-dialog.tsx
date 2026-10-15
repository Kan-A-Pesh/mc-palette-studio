"use client";

import { useState } from "react";
import { Check, Download, FileBox, ImageDown, Link2, X } from "lucide-react";
import {
  encodeSchematic,
  SCHEMATIC_FILE_NAME,
  worldEditCommands,
  type Palette,
} from "@repo/palette-core";
import * as Modal from "@repo/ui/modal";
import { toast } from "@repo/ui/toast";
import { downloadBlob } from "../../_lib/card/download-blob";
import { renderPaletteCard } from "../../_lib/card/render-palette-card";
import { shareUrl } from "../../_lib/card/share-url";
import { slugify } from "../../_lib/card/slugify";
import SectionTitle from "../shared/section-title";
import StudioButton from "../shared/studio-button";
import CommandRow from "./command-row";
import { useCopy } from "./use-copy";

export default function ExportDialog({ palette }: { palette: Palette }) {
  const { copied, copy } = useCopy();
  const [busy, setBusy] = useState<"png" | "schem" | null>(null);
  const commands = worldEditCommands(palette);
  const fixed = palette.mode === "fixed";

  const downloadPng = async () => {
    setBusy("png");
    try {
      downloadBlob(
        await renderPaletteCard(palette),
        `${slugify(palette.name)}.png`,
      );
    } catch {
      toast.error(
        "L'image n'a pas pu être générée : les textures n'ont pas chargé.",
      );
    } finally {
      setBusy(null);
    }
  };

  const downloadSchem = async () => {
    setBusy("schem");
    try {
      const bytes = await encodeSchematic(palette);
      downloadBlob(
        new Blob([bytes as BlobPart]),
        `${SCHEMATIC_FILE_NAME}.schem`,
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <StudioButton variant="primary">
          <Download className="size-4" />
          Exporter
        </StudioButton>
      </Modal.Trigger>
      <Modal.Content
        showClose={false}
        overlayClassName="bg-black/60 backdrop-blur-none"
        className="studio-root studio-dialog flex max-w-160 flex-col rounded-2xl bg-studio-panel text-studio-text shadow-st-dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-studio-line p-5">
          <div>
            <Modal.Title className="text-lg font-semibold text-studio-text">
              Exporter « {palette.name} »
            </Modal.Title>
            <Modal.Description className="mt-1 text-sm text-studio-muted">
              {fixed
                ? "Pattern fixe : charge la tuile en schematic, puis répète-la avec WorldEdit."
                : "Pattern aléatoire : colle une commande WorldEdit ou FAWE en jeu."}
            </Modal.Description>
          </div>
          <Modal.Close
            aria-label="Fermer"
            className="grid size-8 place-items-center rounded-lg text-studio-muted hover:bg-studio-raised hover:text-studio-text focus-visible:outline-2 focus-visible:outline-studio-accent"
          >
            <X className="size-4" />
          </Modal.Close>
        </div>

        <div className="studio-scroll flex flex-col gap-6 overflow-y-auto p-5">
          <section className="flex flex-col gap-3">
            <SectionTitle>WorldEdit / FAWE</SectionTitle>
            {fixed && (
              <StudioButton
                className="self-start"
                onClick={downloadSchem}
                disabled={busy === "schem"}
              >
                <FileBox className="size-4" />
                Télécharger {SCHEMATIC_FILE_NAME}.schem
              </StudioButton>
            )}
            <ol className="flex flex-col gap-3">
              {commands.map((c, i) => (
                <CommandRow
                  key={c.command}
                  command={c}
                  step={fixed ? i + 1 : undefined}
                  copied={copied === c.command}
                  onCopy={() => copy(c.command, c.command)}
                />
              ))}
            </ol>
          </section>

          <section className="flex flex-col gap-3">
            <SectionTitle>Partager</SectionTitle>
            <div className="flex flex-wrap gap-2">
              <StudioButton onClick={() => copy("link", shareUrl(palette))}>
                {copied === "link" ? (
                  <Check className="size-4 text-studio-accent" />
                ) : (
                  <Link2 className="size-4" />
                )}
                {copied === "link" ? "Lien copié" : "Copier le lien de partage"}
              </StudioButton>
              <StudioButton onClick={downloadPng} disabled={busy === "png"}>
                <ImageDown className="size-4" />
                {busy === "png" ? "Génération…" : "Télécharger en PNG"}
              </StudioButton>
            </div>
            <p className="text-xs text-studio-muted">
              Le lien contient toute la palette : la personne qui l’ouvre la
              retrouve à l’identique, sans compte.
            </p>
          </section>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}
