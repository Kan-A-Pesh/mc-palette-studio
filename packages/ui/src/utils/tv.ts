import { createTV } from "tailwind-variants";
import { twMergeConfig } from "@/utils/tw-merge-config";
export type { VariantProps, ClassValue } from "tailwind-variants";

export const tv = createTV({
  twMergeConfig,
});
