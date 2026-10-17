"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createPalette,
  LATEST_VERSION,
  MAX_TILE_SIZE,
  resizeTile,
  type Palette,
  type PatternMode,
  type VariationMode,
  withoutUnavailable,
} from "@repo/palette-core";
import {
  DEFAULT_WEIGHT,
  MAIN_WEIGHT,
  NEW_PALETTE_BLOCK,
  STARTER_PALETTE,
} from "./studio-constants";

/** Camera of the 3D preview: "2d" looks straight down, orthographic. */
type PreviewMode = "2d" | "3d";

type Projection = "perspective" | "orthographic";

/** Why the sidebar shows the block picker: a new main block, or the mix. */
export type PickerPurpose = "main" | "add";

interface StudioState {
  palettes: Record<string, Palette>;
  activeId: string;
  variationMode: VariationMode;
  tolerance: number;
  previewMode: PreviewMode;
  /** Projection of the free 3D camera. */
  projection: Projection;
  previewSize: number;
  showGrid: boolean;
  /** Block painted into the fixed tile. */
  brushId: string | null;
  /** The sidebar shows the block picker instead of the palette when set. */
  picker: PickerPurpose | null;

  update: (
    patch: Partial<Palette> | ((p: Palette) => Partial<Palette>),
  ) => void;
  setMainBlock: (blockId: string) => void;
  toggleEntry: (blockId: string) => void;
  setWeight: (blockId: string, weight: number) => void;
  removeEntry: (blockId: string) => void;
  setVersion: (version: string) => void;
  /** Drops the blocks the palette's release lacks, except the main one. */
  removeUnavailable: () => void;
  setMode: (mode: PatternMode) => void;
  reseed: () => void;
  paintCell: (index: number, blockId: string | null) => void;
  resizeTile: (width: number, height: number) => void;
  fillTile: (cells: (string | null)[]) => void;

  newPalette: () => void;
  importPalette: (palette: Palette) => void;
  duplicatePalette: (id: string) => void;
  deletePalette: (id: string) => void;
  selectPalette: (id: string) => void;

  setVariationMode: (mode: VariationMode) => void;
  setTolerance: (tolerance: number) => void;
  setPreviewMode: (mode: PreviewMode) => void;
  setProjection: (projection: Projection) => void;
  setPreviewSize: (size: number) => void;
  setShowGrid: (show: boolean) => void;
  setBrush: (blockId: string | null) => void;
  openPicker: (purpose: PickerPurpose) => void;
  closePicker: () => void;
}

type PersistedState = Pick<
  StudioState,
  | "palettes"
  | "activeId"
  | "variationMode"
  | "tolerance"
  | "previewMode"
  | "projection"
  | "previewSize"
  | "showGrid"
>;

/**
 * What versions 1 and 2 of the store wrote to localStorage: palettes without
 * a game version (v1) or with a wall/floor surface, and no projection.
 */
type PersistedStateV2 = Omit<PersistedState, "palettes" | "projection"> & {
  palettes: Record<
    string,
    Omit<Palette, "version"> & { version?: string; surface?: string }
  >;
  projection?: Projection;
};

const starterPalette = () =>
  createPalette(STARTER_PALETTE.mainBlockId, {
    name: STARTER_PALETTE.name,
    entries: STARTER_PALETTE.entries.map((e) => ({ ...e })),
  });

const clampSide = (side: number) => Math.min(MAX_TILE_SIZE, Math.max(1, side));

const initial = starterPalette();

/** Palettes and studio preferences, persisted in localStorage. */
export const useStudio = create<StudioState>()(
  persist(
    (set, get) => {
      const update: StudioState["update"] = (patch) =>
        set((state) => {
          const current = state.palettes[state.activeId];
          if (!current) return state;
          const changes = typeof patch === "function" ? patch(current) : patch;
          return {
            palettes: {
              ...state.palettes,
              [current.id]: { ...current, ...changes, updatedAt: Date.now() },
            },
          };
        });
      const add = (palette: Palette) =>
        set((s) => ({
          palettes: { ...s.palettes, [palette.id]: palette },
          activeId: palette.id,
          brushId: null,
          picker: null,
        }));

      return {
        palettes: { [initial.id]: initial },
        activeId: initial.id,
        variationMode: "color",
        tolerance: 50,
        previewMode: "2d",
        projection: "perspective",
        previewSize: 24,
        showGrid: false,
        brushId: null,
        picker: null,

        update,

        setMainBlock: (blockId) =>
          update((p) => {
            if (blockId === p.mainBlockId) return {};
            // The new main block takes the old one's place and weight; the
            // variations already picked stay in the mix.
            const previous = p.entries.find((e) => e.blockId === p.mainBlockId);
            const rest = p.entries.filter(
              (e) => e.blockId !== blockId && e.blockId !== p.mainBlockId,
            );
            const main = { blockId, weight: previous?.weight ?? MAIN_WEIGHT };
            const cells = p.tile.cells.map((c) => (c === blockId ? null : c));
            return {
              mainBlockId: blockId,
              entries: [main, ...rest],
              tile: { ...p.tile, cells },
            };
          }),

        toggleEntry: (blockId) =>
          update((p) => {
            if (blockId === p.mainBlockId) return {};
            const has = p.entries.some((e) => e.blockId === blockId);
            return {
              entries: has
                ? p.entries.filter((e) => e.blockId !== blockId)
                : [...p.entries, { blockId, weight: DEFAULT_WEIGHT }],
            };
          }),

        setWeight: (blockId, weight) =>
          update((p) => ({
            entries: p.entries.map((e) =>
              e.blockId === blockId ? { ...e, weight } : e,
            ),
          })),

        removeEntry: (blockId) =>
          update((p) =>
            blockId === p.mainBlockId
              ? {}
              : {
                  entries: p.entries.filter((e) => e.blockId !== blockId),
                  tile: {
                    ...p.tile,
                    cells: p.tile.cells.map((c) => (c === blockId ? null : c)),
                  },
                },
          ),

        setVersion: (version) => update({ version }),
        removeUnavailable: () => update(withoutUnavailable),

        setMode: (mode) => update({ mode }),
        reseed: () =>
          update((p) => ({
            seed: (p.seed % 99991) + 1 + Math.floor(Math.random() * 997),
          })),

        paintCell: (index, blockId) =>
          update((p) => {
            const cells = [...p.tile.cells];
            cells[index] = blockId === p.mainBlockId ? null : blockId;
            return { tile: { ...p.tile, cells } };
          }),
        resizeTile: (width, height) =>
          update((p) => ({
            tile: resizeTile(p.tile, clampSide(width), clampSide(height)),
          })),
        fillTile: (cells) => update((p) => ({ tile: { ...p.tile, cells } })),

        newPalette: () =>
          add(
            createPalette(NEW_PALETTE_BLOCK, {
              name: `Palette ${Object.keys(get().palettes).length + 1}`,
            }),
          ),
        importPalette: add,
        duplicatePalette: (id) => {
          const source = get().palettes[id];
          if (!source) return;
          add(
            createPalette(source.mainBlockId, {
              ...source,
              id: undefined,
              name: `${source.name} (copy)`,
              updatedAt: Date.now(),
            }),
          );
        },
        deletePalette: (id) =>
          set((s) => {
            const rest = { ...s.palettes };
            delete rest[id];
            const remaining = Object.values(rest).sort(
              (a, b) => b.updatedAt - a.updatedAt,
            );
            const next = remaining[0];
            if (!next) {
              const fresh = starterPalette();
              return { palettes: { [fresh.id]: fresh }, activeId: fresh.id };
            }
            return {
              palettes: rest,
              activeId: s.activeId === id ? next.id : s.activeId,
            };
          }),
        selectPalette: (id) =>
          set({ activeId: id, brushId: null, picker: null }),

        setVariationMode: (variationMode) => set({ variationMode }),
        setTolerance: (tolerance) => set({ tolerance }),
        setPreviewMode: (previewMode) => set({ previewMode }),
        setProjection: (projection) => set({ projection }),
        setPreviewSize: (previewSize) => set({ previewSize }),
        setShowGrid: (showGrid) => set({ showGrid }),
        setBrush: (brushId) => set({ brushId }),
        openPicker: (picker) => set({ picker }),
        closePicker: () => set({ picker: null }),
      };
    },
    {
      name: "palette-studio",
      version: 3,
      // v1 palettes predate game versions: they target the latest release.
      // v2 palettes carry a surface the 3D-only preview no longer uses.
      migrate: (persisted) => {
        const state = persisted as PersistedStateV2;
        const palettes = Object.fromEntries(
          Object.entries(state.palettes).map(([id, p]) => {
            const palette = { ...p, version: p.version ?? LATEST_VERSION };
            delete palette.surface;
            return [id, palette];
          }),
        );
        return {
          ...state,
          palettes,
          projection: state.projection ?? "perspective",
        };
      },
      partialize: (s): PersistedState => ({
        palettes: s.palettes,
        activeId: s.activeId,
        variationMode: s.variationMode,
        tolerance: s.tolerance,
        previewMode: s.previewMode,
        projection: s.projection,
        previewSize: s.previewSize,
        showGrid: s.showGrid,
      }),
    },
  ),
);
