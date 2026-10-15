import type { BlockInfo } from "@repo/palette-core";

/** A block offered for the palette, highlighted when main or already picked. */
export interface BlockChoiceProps {
  block: BlockInfo;
  isMain: boolean;
  selected: boolean;
}
