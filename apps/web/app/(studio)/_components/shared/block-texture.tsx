"use client";

import { getBlock, type FaceName } from "@repo/palette-core";
import { cn } from "@repo/ui/utils/cn";
import { useFaceUrl } from "../../_lib/textures/use-face-url";

interface BlockTextureProps {
  blockId: string;
  face?: FaceName;
  size?: number;
  className?: string;
}

/** A block face drawn pixel-perfect; shows the average colour while loading. */
export default function BlockTexture({
  blockId,
  face = "side",
  size = 32,
  className,
}: BlockTextureProps) {
  const info = getBlock(blockId)?.faces[face];
  const url = useFaceUrl(info);

  return (
    <span
      aria-hidden
      className={cn(
        "pixelated block shrink-0 rounded-st-tex bg-cover",
        "-outline-offset-1 outline-1 outline-white/10",
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: info?.color,
        backgroundImage: url ? `url(${url})` : undefined,
      }}
    />
  );
}
