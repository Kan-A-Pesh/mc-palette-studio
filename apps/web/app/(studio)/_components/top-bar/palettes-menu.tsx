"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { cn } from "@repo/ui/utils/cn";
import { useStudio } from "../../_lib/studio-store";
import PaletteMenuRow from "./palette-menu-row";

/** Saved palettes: switch, duplicate, delete, create. */
export default function PalettesMenu() {
  const palettes = useStudio((s) => s.palettes);
  const activeId = useStudio((s) => s.activeId);
  const newPalette = useStudio((s) => s.newPalette);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const list = Object.values(palettes).sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );
  const close = () => setOpen(false);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(!open)}
        className="flex h-9 items-center gap-1.5 px-2.5 text-sm text-studio-muted hover:bg-studio-raised hover:text-studio-text focus-visible:outline-2 focus-visible:outline-studio-accent"
      >
        Palettes
        <span className="bg-studio-raised px-1.5 text-xs tabular-nums">
          {list.length}
        </span>
        <ChevronDown
          className={cn(
            "size-4 transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="absolute left-0 top-11 z-40 w-80 origin-top-left bg-studio-panel p-1.5 shadow-st-popover animate-in fade-in-0 zoom-in-95">
          <ul className="studio-scroll flex max-h-80 flex-col overflow-y-auto">
            {list.map((p) => (
              <PaletteMenuRow
                key={p.id}
                palette={p}
                active={p.id === activeId}
                onDone={close}
              />
            ))}
          </ul>
          <div className="mt-1 border-t border-studio-line pt-1">
            <button
              type="button"
              onClick={() => {
                newPalette();
                close();
              }}
              className="flex w-full items-center gap-2 px-2 py-2 text-sm text-studio-text hover:bg-studio-raised focus-visible:outline-2 focus-visible:outline-studio-accent"
            >
              <Plus className="size-4 text-studio-accent" />
              New palette
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
