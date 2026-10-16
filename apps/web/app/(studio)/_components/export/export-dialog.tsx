"use client";

import { useState } from "react";
import { Check, Download, FileBox, ImageDown, Link2, X } from "lucide-react";
import {
  encodeSchematic,
  SCHEMATIC_FILE_NAMES,
  worldEditCommands,
  type Palette,
  type Surface,
} from "@repo/palette-core";
import * as Modal from "@repo/ui/modal";
import { toast } from "@repo/ui/toast";
import { downloadBlob } from "../../_lib/card/download-blob";
import { renderPaletteCard } from "../../_lib/card/render-palette-card";
import { shareUrl } from "../../_lib/card/share-url";
import { slugify } from "../../_lib/card/slugify";
import SectionTitle from "../shared/section-title";
import Segmented from "../shared/segmented";
import StudioButton from "../shared/studio-button";
import CommandRow from "./command-row";
import { useCopy } from "./use-copy";

export default function ExportDialog({ palette }: { palette: Palette }) {
  const { copied, copy } = useCopy();
  const [busy, setBusy] = useState<"png" | "schem" | null>(null);
  // Where the fixed tile is laid: flat on the floor or upright on a wall.
  const [surface, setSurface] = useState<Surface>("wall");
  const commands = worldEditCommands(palette, surface);
  const fixed = palette.mode === "fixed";

  const downloadPng = async () => {
    setBusy("png");
    try {
      downloadBlob(
        await renderPaletteCard(palette),
        `${slugify(palette.name)}.png`,
      );
    } catch {
      toast.error("Could not render the image.");
    } finally {
      setBusy(null);
    }
  };

  const downloadSchem = async () => {
    setBusy("schem");
    try {
      const bytes = await encodeSchematic(palette, surface);
      downloadBlob(
        new Blob([bytes as BlobPart]),
        `${SCHEMATIC_FILE_NAMES[surface]}.schem`,
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
          Export
        </StudioButton>
      </Modal.Trigger>
      <Modal.Content
        showClose={false}
        aria-describedby={undefined}
        overlayClassName="bg-black/60 backdrop-blur-none"
        className="studio-root studio-dialog flex max-w-160 flex-col rounded-none bg-studio-panel text-studio-text shadow-st-dialog"
      >
        <div className="flex items-center justify-between gap-4 border-b border-studio-line p-5">
          <Modal.Title className="text-lg font-semibold text-studio-text">
            Export “{palette.name}”
          </Modal.Title>
          <Modal.Close
            aria-label="Close"
            className="grid size-8 place-items-center text-studio-muted hover:bg-studio-raised hover:text-studio-text focus-visible:outline-2 focus-visible:outline-studio-accent"
          >
            <X className="size-4" />
          </Modal.Close>
        </div>

        <div className="studio-scroll flex flex-col gap-6 overflow-y-auto p-5">
          <section className="flex flex-col gap-3">
            <SectionTitle>WorldEdit / FAWE</SectionTitle>
            {fixed && (
              <div className="flex flex-wrap items-center gap-2">
                <Segmented
                  label="Tile orientation"
                  value={surface}
                  onChange={setSurface}
                  options={[
                    { value: "wall", label: "Wall" },
                    { value: "floor", label: "Floor" },
                  ]}
                />
                <StudioButton
                  onClick={downloadSchem}
                  disabled={busy === "schem"}
                >
                  <FileBox className="size-4" />
                  {SCHEMATIC_FILE_NAMES[surface]}.schem
                </StudioButton>
              </div>
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
            <SectionTitle>Share</SectionTitle>
            <div className="flex flex-wrap gap-2">
              <StudioButton onClick={() => copy("link", shareUrl(palette))}>
                {copied === "link" ? (
                  <Check className="size-4 text-studio-accent" />
                ) : (
                  <Link2 className="size-4" />
                )}
                {copied === "link" ? "Copied" : "Copy link"}
              </StudioButton>
              <StudioButton onClick={downloadPng} disabled={busy === "png"}>
                <ImageDown className="size-4" />
                {busy === "png" ? "Rendering…" : "PNG"}
              </StudioButton>
            </div>
          </section>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}
