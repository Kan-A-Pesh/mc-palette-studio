"use client";

import type { FaceName } from "@repo/palette-core";
import { cn } from "@repo/ui/utils/cn";
import { useStudio } from "../../_lib/studio-store";
import type { BlockChoiceProps } from "../shared/block-choice-types";
import BlockTexture from "../shared/block-texture";

interface SuggestionCellProps extends BlockChoiceProps {
  face: FaceName;
}

export default function SuggestionCell({
  block,
  face,
  isMain,
  selected,
}: SuggestionCellProps) {
  const toggleEntry = useStudio((s) => s.toggleEntry);
  return (
    <li>
      <button
        type="button"
        disabled={isMain}
        aria-pressed={selected}
        aria-label={`${selected ? "Remove" : "Add"} ${block.name}`}
        title={isMain ? `${block.name} (main block)` : block.name}
        onClick={() => toggleEntry(block.id)}
        className={cn(
          "relative grid aspect-square w-full place-items-center p-1 transition duration-150",
          "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-studio-accent",
          isMain && "shadow-st-selected",
          !isMain &&
            selected &&
            "bg-studio-accent-soft shadow-st-selected-soft",
          !isMain && !selected && "bg-studio-canvas hover:bg-studio-raised",
        )}
      >
        <BlockTexture blockId={block.id} face={face} size={34} />
        {selected && !isMain && (
          <span className="absolute -right-1 -top-1 grid size-4 place-items-center bg-studio-accent text-st-2xs font-bold text-studio-accent-ink">
            ✓
          </span>
        )}
      </button>
    </li>
  );
}
