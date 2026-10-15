import { RiPaletteLine, RiUser6Line } from "@repo/ui/icon";

import Appearance from "./appearance";
import AccountSettings from "./my-account";

export const tabStructure = [
  {
    key: "myAccount",
    icon: RiUser6Line,
    component: AccountSettings,
  },
  {
    key: "appearance",
    icon: RiPaletteLine,
    component: Appearance,
  },
] as const;
