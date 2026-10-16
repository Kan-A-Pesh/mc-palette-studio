"use client";

import { TriangleAlert } from "lucide-react";
import { unavailableBlocks, type Palette } from "@repo/palette-core";
import { useStudio } from "../../_lib/studio-store";
import StudioButton from "../shared/studio-button";

/** Lists the palette's blocks that do not exist in its Java release. */
export default function UnavailableNotice({ palette }: { palette: Palette }) {
  const removeUnavailable = useStudio((s) => s.removeUnavailable);
  const missing = unavailableBlocks(palette);
  if (missing.length === 0) return null;
  const removable = missing.filter((b) => b.id !== palette.mainBlockId);

  return (
    <section
      role="status"
      className="flex flex-col gap-2 bg-studio-canvas p-3 text-xs text-studio-muted ring-1 ring-studio-danger/40"
    >
      <p className="flex items-center gap-1.5 font-medium text-studio-text">
        <TriangleAlert className="size-3.5 shrink-0 text-studio-danger" />
        Not in Java {palette.version}
      </p>
      <ul className="flex flex-col gap-0.5">
        {missing.map((b) => (
          <li key={b.id}>
            {b.name}
            {b.id === palette.mainBlockId && " (main block)"}
            <span className="text-studio-faint"> · added in {b.since}</span>
          </li>
        ))}
      </ul>
      {removable.length > 0 && (
        <StudioButton
          size="sm"
          className="self-start"
          onClick={removeUnavailable}
        >
          Remove {removable.length} from the palette
        </StudioButton>
      )}
    </section>
  );
}
