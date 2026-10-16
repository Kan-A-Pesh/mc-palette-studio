"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { Palette } from "@repo/palette-core";
import { blockMaterial } from "../../_lib/block-material";
import { buildCorner } from "../../_lib/build-corner";
import { fitOrthographic } from "../../_lib/fit-orthographic";
import { gridLines } from "../../_lib/grid-lines";
import type { PreviewView } from "../../_lib/preview-types";
import { PREVIEW_ARIA_LABELS } from "../../_lib/studio-constants";
import { loadFaces } from "../../_lib/textures/load-faces";
import { wallHeight } from "../../_lib/wall-height";

export interface Preview3dProps {
  palette: Palette;
  size: number;
  view: PreviewView;
  grid: boolean;
}

interface SceneContext {
  renderer: THREE.WebGLRenderer;
  group: THREE.Group;
  grid: THREE.Group;
  perspective: THREE.PerspectiveCamera;
  orthographic: THREE.OrthographicCamera;
  camera: THREE.Camera;
  controls: OrbitControls | null;
  /** Blocks shown above and below the center by the orthographic camera. */
  halfHeight: number;
  render: () => void;
}

/**
 * Interactive corner of a building: a floor and two walls. The "top" view
 * looks straight down with an orthographic camera; the others orbit freely.
 */
export default function Preview3d({
  palette,
  size,
  view,
  grid,
}: Preview3dProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneContext | null>(null);
  const [failed, setFailed] = useState(false);

  // Renderer, scene and both cameras live as long as the component.
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
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute("role", "img");
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x4a4036, 1.6));
    const sun = new THREE.DirectionalLight(0xffffff, 1.9);
    sun.position.set(0.7, 1.4, 1.1);
    scene.add(sun);
    const group = new THREE.Group();
    const gridGroup = new THREE.Group();
    scene.add(group, gridGroup);

    let frame = 0;
    const perspective = new THREE.PerspectiveCamera(40, 1, 0.1, 500);
    const ctx: SceneContext = {
      renderer,
      group,
      grid: gridGroup,
      perspective,
      orthographic: new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000),
      camera: perspective,
      controls: null,
      halfHeight: 1,
      render: () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          if (ctx.controls?.update()) ctx.render();
          renderer.render(scene, ctx.camera);
        });
      },
    };

    const observer = new ResizeObserver(() => {
      const { clientWidth, clientHeight } = mount;
      if (!clientWidth || !clientHeight) return;
      renderer.setSize(clientWidth, clientHeight);
      const aspect = clientWidth / clientHeight;
      ctx.perspective.aspect = aspect;
      ctx.perspective.updateProjectionMatrix();
      fitOrthographic(ctx.orthographic, aspect, ctx.halfHeight);
      ctx.render();
    });
    observer.observe(mount);

    sceneRef.current = ctx;
    return () => {
      sceneRef.current = null;
      cancelAnimationFrame(frame);
      mount.removeChild(renderer.domElement);
      observer.disconnect();
      group.userData.dispose?.();
      gridGroup.userData.dispose?.();
      ctx.controls?.dispose();
      renderer.dispose();
    };
  }, []);

  // Pick the camera for the view and frame the scene.
  useEffect(() => {
    const ctx = sceneRef.current;
    if (!ctx) return;
    // The corner spans -1..size on x and z.
    const middle = (size - 1) / 2;
    const height = wallHeight(size);
    const camera = view === "perspective" ? ctx.perspective : ctx.orthographic;

    const target = new THREE.Vector3(middle, height / 3, middle);
    if (view === "top") {
      target.set(middle, 0, middle);
      // The back wall stays at the top of the screen.
      camera.up.set(0, 0, -1);
      camera.position.set(middle, height + 50, middle);
    } else {
      camera.up.set(0, 1, 0);
      camera.position.set(
        target.x + size * 1.45,
        target.y + size,
        target.z + size * 1.6,
      );
    }
    if (camera instanceof THREE.OrthographicCamera) {
      const { clientWidth, clientHeight } = ctx.renderer.domElement;
      ctx.halfHeight = view === "top" ? (size + 2) / 2 : size * 0.8;
      camera.zoom = 1;
      fitOrthographic(
        camera,
        clientWidth && clientHeight ? clientWidth / clientHeight : 1,
        ctx.halfHeight,
      );
    }

    ctx.controls?.dispose();
    const controls = new OrbitControls(camera, ctx.renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.copy(target);
    if (view === "top") {
      controls.enableRotate = false;
      controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
      controls.touches.ONE = THREE.TOUCH.PAN;
    } else {
      controls.maxPolarAngle = Math.PI * 0.49;
    }
    controls.addEventListener("change", ctx.render);
    controls.update();
    ctx.controls = controls;
    ctx.camera = camera;
    ctx.renderer.domElement.setAttribute(
      "aria-label",
      PREVIEW_ARIA_LABELS[view],
    );
    ctx.render();
  }, [view, size]);

  // Grid lines over the floor, one square per block.
  useEffect(() => {
    const ctx = sceneRef.current;
    if (!ctx) return;
    ctx.grid.userData.dispose?.();
    ctx.grid.clear();
    if (grid) {
      const lines = gridLines(size);
      ctx.grid.add(lines);
      ctx.grid.userData.dispose = () => {
        lines.geometry.dispose();
        lines.material.dispose();
      };
    }
    ctx.render();
  }, [grid, size]);

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
        WebGL is not available.
      </p>
    );
  }
  return (
    <div
      ref={mountRef}
      className={
        view === "top"
          ? "h-full w-full cursor-move"
          : "h-full w-full cursor-grab active:cursor-grabbing"
      }
    />
  );
}
