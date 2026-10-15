import {
  RiAlarmWarningLine,
  RiBankCardLine,
  RiIdCardLine,
} from "@repo/ui/icon";

import Danger from "./danger";
import Details from "./details";
import Plan from "./plan";

export const tabStructure = [
  {
    key: "details",
    icon: RiIdCardLine,
    component: Details,
  },
  {
    key: "plan",
    icon: RiBankCardLine,
    component: Plan,
  },
  {
    key: "danger",
    icon: RiAlarmWarningLine,
    component: Danger,
  },
] as const;

export const tabLabels = {
  details: "Details",
  plan: "Plan & Billing",
  danger: "Danger Zone",
} as const;
