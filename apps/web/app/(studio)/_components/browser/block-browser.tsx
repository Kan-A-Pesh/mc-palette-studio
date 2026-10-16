"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Search, X } from "lucide-react";
import { BLOCKS, isAvailable, type Category } from "@repo/palette-core";
import { PICKER_TITLES } from "../../_lib/studio-constants";
import { useStudio, type PickerPurpose } from "../../_lib/studio-store";
import { useActivePalette } from "../../_lib/use-active-palette";
import SectionTitle from "../shared/section-title";
import BlockCell from "./block-cell";
import CategoryFilter from "./category-filter";

/** The sidebar's block picker; Escape or the back arrow return to the palette. */
export default function BlockBrowser({ purpose }: { purpose: PickerPurpose }) {
  const palette = useActivePalette();
  const closePicker = useStudio((s) => s.closePicker);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const deferredQuery = useDeferredValue(query);
  const version = palette.version;

  const results = useMemo(() => {
    const terms = deferredQuery
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    return BLOCKS.filter(
      (b) =>
        isAvailable(b, version) &&
        (category === "all" || b.category === category) &&
        terms.every(
          (t) => b.id.includes(t) || b.name.toLowerCase().includes(t),
        ),
    );
  }, [deferredQuery, category, version]);

  const inPalette = new Set(palette.entries.map((e) => e.blockId));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closePicker();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closePicker]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-3 border-b border-studio-line p-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Back to the palette"
            onClick={closePicker}
            className="-ml-1.5 grid size-7 place-items-center text-studio-muted hover:bg-studio-raised hover:text-studio-text focus-visible:outline-2 focus-visible:outline-studio-accent"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="min-w-0 flex-1">
            <SectionTitle
              aside={
                <span className="text-xs tabular-nums text-studio-faint">
                  {results.length}
                </span>
              }
            >
              {PICKER_TITLES[purpose]}
            </SectionTitle>
          </div>
        </div>
        <label className="relative block">
          <span className="sr-only">Search blocks</span>
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-studio-faint" />
          <input
            // The picker opens on demand: typing is the next step.
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            spellCheck={false}
            className="h-9 w-full bg-studio-canvas pl-8 pr-8 text-sm text-studio-text ring-1 ring-studio-line placeholder:text-studio-faint focus:outline-none focus:ring-2 focus:ring-studio-accent"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute right-1.5 top-1/2 grid size-6 -translate-y-1/2 place-items-center text-studio-faint hover:text-studio-text"
            >
              <X className="size-3.5" />
            </button>
          )}
        </label>
        <CategoryFilter value={category} onChange={setCategory} />
      </div>

      <div className="studio-scroll min-h-0 flex-1 overflow-y-auto p-3">
        {results.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm text-studio-muted">
            No blocks found.
          </p>
        ) : (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(44px,1fr))] gap-1">
            {results.map((block) => (
              <BlockCell
                key={block.id}
                purpose={purpose}
                block={block}
                isMain={block.id === palette.mainBlockId}
                selected={inPalette.has(block.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
