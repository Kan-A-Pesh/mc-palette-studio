"use client";

import { cn } from "@repo/ui/utils/cn";
import { useStudio } from "../../_lib/studio-store";
import type { BlockChoiceProps } from "../shared/block-choice-types";
import BlockTexture from "../shared/block-texture";

/** Click sets the main block; the corner badge adds or removes it from the mix. */
export default function BlockCell({
  block,
  isMain,
  selected,
}: BlockChoiceProps) {
  const setMainBlock = useStudio((s) => s.setMainBlock);
  const toggleEntry = useStudio((s) => s.toggleEntry);

  return (
    <li className="group relative">
      <button
        type="button"
        title={`${block.name} — clic : bloc principal`}
        aria-label={`${block.name}${isMain ? " (bloc principal)" : ""}`}
        onClick={() => setMainBlock(block.id)}
        className={cn(
          "grid aspect-square w-full place-items-center rounded-lg p-1 transition duration-150",
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
      {!isMain && (
        <button
          type="button"
          aria-label={
            selected
              ? `Retirer ${block.name} de la palette`
              : `Ajouter ${block.name} à la palette`
          }
          title={selected ? "Retirer de la palette" : "Ajouter à la palette"}
          onClick={() => toggleEntry(block.id)}
          className={cn(
            "absolute -right-1 -top-1 grid size-5 place-items-center rounded-full text-st-md font-semibold leading-none transition-opacity duration-150",
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
