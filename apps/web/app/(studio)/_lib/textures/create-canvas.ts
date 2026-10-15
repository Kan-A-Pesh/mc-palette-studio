/** A blank canvas of the given size with a crisp 2D context. */
export function createCanvas(width: number, height: number) {
  const canvas = Object.assign(document.createElement("canvas"), {
    width,
    height,
  });
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unavailable");
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx };
}
