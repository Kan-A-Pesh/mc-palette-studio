import { textureUrl, type FaceInfo } from "@repo/palette-core";
import { createCanvas } from "./create-canvas";
import { textureCache } from "./texture-cache";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Texture not found: ${src}`));
    img.src = src;
  });
}

/**
 * Fetches a face from the assets mirror, keeps its first animation frame and
 * multiplies its biome tint. Cached per texture and tint.
 */
export function loadFaceCanvas(face: FaceInfo): Promise<HTMLCanvasElement> {
  const key = textureCache.key(face);
  const cached = textureCache.canvases.get(key);
  if (cached) return cached;

  const pending = loadImage(textureUrl(face)).then((img) => {
    const size = img.width;
    const { canvas, ctx } = createCanvas(size, size);
    ctx.drawImage(img, 0, 0, size, size, 0, 0, size, size);
    if (face.tint) {
      // Multiply the tint while keeping the texture's own alpha.
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = face.tint;
      ctx.fillRect(0, 0, size, size);
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(img, 0, 0, size, size, 0, 0, size, size);
      ctx.globalCompositeOperation = "source-over";
    }
    textureCache.urls.set(key, canvas.toDataURL());
    return canvas;
  });
  // A failed fetch can be retried on the next render.
  pending.catch(() => textureCache.canvases.delete(key));
  textureCache.canvases.set(key, pending);
  return pending;
}
