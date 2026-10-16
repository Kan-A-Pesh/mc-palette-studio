"use client";

import { useMemo } from "react";
import { getBlock, suggestVariations } from "@repo/palette-core";
import { cn } from "@repo/ui/utils/cn";
import {
  QUICK_ADD_COUNT,
  VARIATION_MODE_OPTIONS,
} from "../../_lib/studio-constants";
import { useStudio } from "../../_lib/studio-store";
import { useActivePalette } from "../../_lib/use-active-palette";
import Range from "../shared/range";
import SectionTitle from "../shared/section-title";
import Segmented from "../shared/segmented";
import StudioButton from "../shared/studio-button";
import SuggestionCell from "./suggestion-cell";

export default function VariationsPanel() {
  const palette = useActivePalette();
  const mode = useStudio((s) => s.variationMode);
  const setMode = useStudio((s) => s.setVariationMode);
  const tolerance = useStudio((s) => s.tolerance);
  const setTolerance = useStudio((s) => s.setTolerance);
  const update = useStudio((s) => s.update);

  const main = getBlock(palette.mainBlockId);
  const suggestions = useMemo(
    () =>
      main
        ? suggestVariations(main, mode, {
            tolerance,
            limit: 18,
            version: palette.version,
          })
        : [],
    [main, mode, tolerance, palette.version],
  );
  const inPalette = new Set(palette.entries.map((e) => e.blockId));
  const notAdded = suggestions.filter((s) => !inPalette.has(s.block.id));
  const quickAdd = notAdded.slice(0, QUICK_ADD_COUNT);

  const addFirst = () =>
    update((p) => ({
      entries: [
        ...p.entries,
        ...quickAdd.map((s) => ({ blockId: s.block.id, weight: 15 })),
      ],
    }));

  return (
    <section className="flex flex-col gap-3" aria-labelledby="variations-title">
      <SectionTitle id="variations-title">Variations</SectionTitle>
      <Segmented
        label="Variation type"
        value={mode}
        onChange={setMode}
        className="w-full"
        options={VARIATION_MODE_OPTIONS}
      />
      {mode !== "family" && (
        <div className="flex items-center gap-3">
          <span className="w-16 shrink-0 text-xs text-studio-muted">
            Tolerance
          </span>
          <Range
            label="Tolerance"
            value={tolerance}
            min={0}
            max={100}
            onChange={setTolerance}
          />
          <span className="w-8 shrink-0 text-right text-xs tabular-nums text-studio-muted">
            {tolerance}
          </span>
        </div>
      )}

      {suggestions.length === 0 ? (
        <p className="bg-studio-canvas px-3 py-4 text-center text-xs text-studio-muted">
          Nothing close enough.
        </p>
      ) : (
        <ul
          className={cn(
            "grid gap-1.5",
            mode === "gradient"
              ? "grid-cols-[repeat(auto-fill,minmax(44px,1fr))]"
              : "grid-cols-6",
          )}
        >
          {suggestions.map(({ block }) => (
            <SuggestionCell
              key={block.id}
              block={block}
              isMain={block.id === palette.mainBlockId}
              selected={inPalette.has(block.id)}
            />
          ))}
        </ul>
      )}
      {quickAdd.length > 0 && (
        <StudioButton
          size="sm"
          variant="ghost"
          className="self-start"
          onClick={addFirst}
        >
          + Add top {quickAdd.length}
        </StudioButton>
      )}
    </section>
  );
}
