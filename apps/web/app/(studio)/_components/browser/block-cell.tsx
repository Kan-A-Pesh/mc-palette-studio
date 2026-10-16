"use client";

import { cn } from "@repo/ui/utils/cn";
import { useStudio, type PickerPurpose } from "../../_lib/studio-store";
import type { BlockChoiceProps } from "../shared/block-choice-types";
import BlockTexture from "../shared/block-texture";

interface BlockCellProps extends BlockChoiceProps {
  purpose: PickerPurpose;
}

/**
 * Picking the main block sets it and returns to the palette; adding toggles
 * the block in the mix and stays, so several can be added in a row.
 */
export default function BlockCell({
  block,
  isMain,
  selected,
  purpose,
}: BlockCellProps) {
  const setMainBlock = useStudio((s) => s.setMainBlock);
  const toggleEntry = useStudio((s) => s.toggleEntry);
  const closePicker = useStudio((s) => s.closePicker);
  const pick = () => {
    if (purpose === "add") return toggleEntry(block.id);
    setMainBlock(block.id);
    closePicker();
  };

  const adding = purpose === "add";

  return (
    <li className="group relative">
      <button
        type="button"
        title={block.name}
        aria-label={`${block.name}${isMain ? " (main block)" : ""}`}
        aria-pressed={adding && !isMain ? selected : undefined}
        disabled={adding && isMain}
        onClick={pick}
        className={cn(
          "grid aspect-square w-full place-items-center p-1 transition duration-150",
          "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-studio-accent",
          isMain && "bg-studio-accent-soft shadow-st-selected",
          !isMain && selected && "bg-studio-raised shadow-st-ring",
          !isMain && !selected && "hover:bg-studio-raised",
        )}
      >
        <BlockTexture
          blockId={block.id}
          className="aspect-square h-auto! w-full!"
        />
      </button>
      {!isMain && adding && selected && (
        <span
          aria-hidden
          className="pointer-events-none absolute -right-1 -top-1 grid size-5 place-items-center bg-studio-accent text-st-md font-semibold leading-none text-studio-accent-ink"
        >
          ✓
        </span>
      )}
      {!isMain && !adding && (
        <button
          type="button"
          aria-label={
            selected
              ? `Remove ${block.name} from palette`
              : `Add ${block.name} to palette`
          }
          onClick={() => toggleEntry(block.id)}
          className={cn(
            "absolute -right-1 -top-1 grid size-5 place-items-center text-st-md font-semibold leading-none transition-opacity duration-150",
            "focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-studio-accent",
            selected
              ? "bg-studio-accent text-studio-accent-ink opacity-100"
              : "bg-studio-text text-studio-canvas opacity-0 group-hover:opacity-100",
          )}
        >
          {selected ? "✓" : "+"}
        </button>
      )}
    </li>
  );
}
