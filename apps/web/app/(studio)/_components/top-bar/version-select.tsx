"use client";

import { MC_VERSIONS } from "@repo/palette-core";
import * as Select from "@repo/ui/select";
import { useStudio } from "../../_lib/studio-store";
import { useActivePalette } from "../../_lib/use-active-palette";

/** Java release the palette targets: it decides which blocks are offered. */
export default function VersionSelect() {
  const palette = useActivePalette();
  const setVersion = useStudio((s) => s.setVersion);

  return (
    <Select.Root
      variant="compact"
      size="xsmall"
      value={palette.version}
      onValueChange={setVersion}
    >
      <Select.Trigger
        aria-label="Minecraft Java version"
        className="h-7 min-h-7 rounded-none bg-studio-raised text-st-xs tabular-nums text-studio-muted shadow-none ring-0 hover:bg-studio-hover hover:text-studio-text focus:shadow-none focus:ring-2 focus:ring-studio-accent focus:text-studio-text"
      >
        <Select.Value>Java {palette.version}</Select.Value>
      </Select.Trigger>
      <Select.Content className="studio-root rounded-none bg-studio-panel shadow-st-popover ring-0">
        {MC_VERSIONS.map((v) => (
          <Select.Item
            key={v.id}
            value={v.id}
            className="rounded-none py-1.5 text-st-sm tabular-nums text-studio-text data-[highlighted]:bg-studio-raised"
          >
            Java {v.id}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
}
