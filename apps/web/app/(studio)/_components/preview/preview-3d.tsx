"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { Palette } from "@repo/palette-core";
import { blockMaterial } from "../../_lib/block-material";
import { buildCorner } from "../../_lib/build-corner";
import { loadFaces } from "../../_lib/textures/load-faces";

export interface Preview3dProps {
  palette: Palette;
  size: number;
}

interface SceneContext {
  group: THREE.Group;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  render: () => void;
}

/** Interactive corner of a building; drag to orbit, scroll to zoom. */
export default function Preview3d({ palette, size }: Preview3dProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneContext | null>(null);
  const [failed, setFailed] = useState(false);

  // Renderer, camera and controls live as long as the component.
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        preserveDrawingBuffer: true,
      });
    } catch {
      // No WebGL: the 2D preview stays available.
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute("role", "img");
    renderer.domElement.setAttribute(
      "aria-label",
      "Aperçu 3D : un coin de bâtiment, fais glisser pour tourner",
    );
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x4a4036, 1.6));
    const sun = new THREE.DirectionalLight(0xffffff, 1.9);
    sun.position.set(0.7, 1.4, 1.1);
    scene.add(sun);
    const group = new THREE.Group();
    scene.add(group);

    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 500);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI * 0.49;

    let frame = 0;
    const render = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (controls.update()) render();
        renderer.render(scene, camera);
      });
    };
    controls.addEventListener("change", render);

    const observer = new ResizeObserver(() => {
      const { clientWidth, clientHeight } = mount;
      if (!clientWidth || !clientHeight) return;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      render();
    });
    observer.observe(mount);

    sceneRef.current = { group, camera, controls, render };
    return () => {
      sceneRef.current = null;
      cancelAnimationFrame(frame);
      mount.removeChild(renderer.domElement);
      observer.disconnect();
      group.userData.dispose?.();
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Frame the camera whenever the scene size changes.
  useEffect(() => {
    const ctx = sceneRef.current;
    if (!ctx) return;
    const height = Math.max(4, Math.round(size * 0.56));
    const center = new THREE.Vector3(size / 2 - 1, height / 3, size / 2 - 1);
    ctx.controls.target.copy(center);
    ctx.camera.position.set(
      center.x + size * 1.45,
      center.y + size,
      center.z + size * 1.6,
    );
    ctx.render();
  }, [size]);

  // Rebuild the blocks whenever the palette changes.
  useEffect(() => {
    let cancelled = false;
    const placements = buildCorner(palette, size);
    const byBlock = new Map<string, typeof placements>();
    for (const p of placements)
      byBlock.set(p.id, [...(byBlock.get(p.id) ?? []), p]);

    loadFaces(byBlock.keys(), ["top", "side", "bottom"]).then((faces) => {
      const ctx = sceneRef.current;
      if (cancelled || !ctx) return;
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const matrix = new THREE.Matrix4();
      const meshes = [...byBlock].map(([id, list]) => {
        const side = blockMaterial(id, "side", faces);
        // BoxGeometry order: +x, -x, +y, -y, +z, -z.
        const materials = [
          side,
          side,
          blockMaterial(id, "top", faces),
          blockMaterial(id, "bottom", faces),
          side,
          side,
        ];
        const mesh = new THREE.InstancedMesh(geometry, materials, list.length);
        list.forEach((p, i) =>
          mesh.setMatrixAt(
            i,
            matrix.makeTranslation(p.x + 0.5, p.y + 0.5, p.z + 0.5),
          ),
        );
        return mesh;
      });

      ctx.group.userData.dispose?.();
      ctx.group.clear();
      ctx.group.add(...meshes);
      ctx.group.userData.dispose = () => {
        geometry.dispose();
        for (const mesh of meshes) {
          for (const material of new Set(
            mesh.material as THREE.MeshLambertMaterial[],
          )) {
            material.map?.dispose();
            material.dispose();
          }
        }
      };
      ctx.render();
    });
    return () => {
      cancelled = true;
    };
  }, [palette, size]);

  if (failed) {
    return (
      <p className="grid h-full place-items-center px-6 text-center text-sm text-studio-muted">
        Ton navigateur ne gère pas WebGL : la vue 3D est indisponible, la vue 2D
        reste utilisable.
      </p>
    );
  }
  return (
    <div
      ref={mountRef}
      className="h-full w-full cursor-grab active:cursor-grabbing"
    />
  );
}
