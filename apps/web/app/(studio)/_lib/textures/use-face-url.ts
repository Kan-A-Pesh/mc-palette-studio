"use client";

import { useEffect, useState } from "react";
import type { FaceInfo } from "@repo/palette-core";
import { loadFaceCanvas } from "./load-face-canvas";
import { textureCache } from "./texture-cache";

/** Data URL of a face, or `null` while it loads (callers show its average colour). */
export function useFaceUrl(face: FaceInfo | undefined): string | null {
  const key = face ? textureCache.key(face) : "";
  const [loaded, setLoaded] = useState<{ key: string; url: string } | null>(
    null,
  );

  useEffect(() => {
    if (!face || textureCache.urls.has(key)) return;
    let cancelled = false;
    loadFaceCanvas(face)
      .then(() => {
        const url = textureCache.urls.get(key);
        if (!cancelled && url) setLoaded({ key, url });
      })
      .catch(() => setLoaded(null));
    return () => {
      cancelled = true;
    };
  }, [face, key]);

  return (
    textureCache.urls.get(key) ?? (loaded?.key === key ? loaded.url : null)
  );
}
