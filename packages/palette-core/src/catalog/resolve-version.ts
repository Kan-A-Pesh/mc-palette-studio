import { MC_VERSIONS } from "./catalog-constants";
import type { McVersion } from "./catalog-types";

/** The release with this id; unknown or missing ids fall back to the latest. */
export function resolveVersion(id: unknown): McVersion {
  const version = MC_VERSIONS.find((v) => v.id === id) ?? MC_VERSIONS[0];
  if (!version) throw new Error("The block catalog lists no release");
  return version;
}
