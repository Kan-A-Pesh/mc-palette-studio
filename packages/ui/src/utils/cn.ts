import clsx, { type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import { twMergeConfig } from "./tw-merge-config";

export { type ClassValue } from "clsx";

const customTwMerge = extendTailwindMerge(twMergeConfig);

/**
 * Utilizes `clsx` with `tailwind-merge`, use in cases of possible class conflicts.
 */
export function cn(...classes: ClassValue[]) {
  return customTwMerge(clsx(...classes));
}
