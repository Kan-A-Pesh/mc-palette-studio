import * as THREE from "three";

/** One square per block over the floor, which spans 0..size on x and z. */
export function gridLines(size: number) {
  const points: number[] = [];
  // Just above the floor's top face so the lines are not z-fighting.
  const y = 0.002;
  for (let i = 0; i <= size; i++) {
    points.push(i, y, 0, i, y, size, 0, y, i, size, y, i);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(points, 3),
  );
  const material = new THREE.LineBasicMaterial({ color: 0x000000 });
  return new THREE.LineSegments(geometry, material);
}
