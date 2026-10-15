import type { BlockInfo } from "../catalog";
import { gradient } from "./gradient";
import { sameFamily } from "./same-family";
import { similarByColor } from "./similar-by-color";
import type {
  Suggestion,
  VariationMode,
  VariationOptions,
} from "./variation-types";

export function suggestVariations(
  base: BlockInfo,
  mode: VariationMode,
  options: VariationOptions = {},
): Suggestion[] {
  switch (mode) {
    case "color":
      return similarByColor(base, options);
    case "family":
      return sameFamily(base, options);
    case "gradient":
      return gradient(base, options);
  }
}
