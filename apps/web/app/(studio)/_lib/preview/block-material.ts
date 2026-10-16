import * as THREE from "three";
import { getBlock, type FaceName } from "@repo/palette-core";

/** Pixel-crisp material for one face of a block (average colour if missing). */
export function blockMaterial(
  id: string,
  face: FaceName,
  faces: Map<string, HTMLCanvasElement>,
) {
  const block = getBlock(id);
  const canvas = faces.get(`${id}:${face}`);
  const map = canvas ? new THREE.CanvasTexture(canvas) : null;
  if (map) {
    map.magFilter = THREE.NearestFilter;
    map.minFilter = THREE.NearestFilter;
    map.colorSpace = THREE.SRGBColorSpace;
  }
  const transparent = block?.transparent ?? false;
  return new THREE.MeshLambertMaterial({
    map,
    color: map ? 0xffffff : new THREE.Color(block?.faces[face].color ?? "#777"),
    transparent,
    alphaTest: transparent ? 0.1 : 0,
  });
}
