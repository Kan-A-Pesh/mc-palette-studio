import rawCatalog from "../data/blocks.json";
import type { BlockInfo, FaceInfo, FaceName, Lab } from "./catalog-types";
import { categoryOf } from "./category-of";
import { displayName } from "./display-name";
import { familyOf } from "./family-of";

type RawFace = (typeof rawCatalog.blocks)[number]["faces"][FaceName];

const toFace = (face: RawFace): FaceInfo => {
  const lab: Lab = [face.lab[0] ?? 0, face.lab[1] ?? 0, face.lab[2] ?? 0];
  return { ...face, lab };
};

/** Every full-cube block of the catalog, enriched with family and category. */
export const BLOCKS: readonly BlockInfo[] = rawCatalog.blocks.map((b) => {
  const faces = {
    top: toFace(b.faces.top),
    side: toFace(b.faces.side),
    bottom: toFace(b.faces.bottom),
  };
  return {
    id: b.id,
    name: displayName(b.id),
    faces,
    ...familyOf(b.id),
    category: categoryOf(b.id),
    transparent: Object.values(faces).some((f) => f.opacity < 0.98),
    since: b.since,
  };
});
