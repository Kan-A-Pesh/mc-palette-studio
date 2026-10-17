import type { BlockInfo } from "./catalog-types";
import { resolveVersion } from "./resolve-version";

/** Whether `block` exists in survival in the given release. */
export function isAvailable(block: BlockInfo, version: string): boolean {
  return (
    resolveVersion(block.since).dataVersion <=
    resolveVersion(version).dataVersion
  );
}
