import { CATEGORY_RULES } from "./catalog-constants";
import type { Category } from "./catalog-types";

export function categoryOf(id: string): Category {
  for (const [category, rule] of CATEGORY_RULES) {
    if (rule.test(id)) return category;
  }
  return "stone";
}
