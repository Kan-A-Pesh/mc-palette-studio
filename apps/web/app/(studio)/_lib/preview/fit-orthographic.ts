import type { OrthographicCamera } from "three";

/** Sizes the frustum to show `halfHeight` blocks above and below the center. */
export function fitOrthographic(
  camera: OrthographicCamera,
  aspect: number,
  halfHeight: number,
) {
  // Narrow viewports keep the whole width in view.
  const half = aspect < 1 ? halfHeight / aspect : halfHeight;
  camera.top = half;
  camera.bottom = -half;
  camera.left = -half * aspect;
  camera.right = half * aspect;
  camera.updateProjectionMatrix();
}
