import { RiStarFill } from "@repo/ui/icon";
import type * as React from "react";

import type { PlanBadgeType } from "@repo/database/stripe";

export const defaultLabels = {
  title: "Choose a plan",
  monthly: "Monthly",
  yearly: "Yearly",
  summary: "Summary",
  currentPlan: "Current plan",
  newPlan: "New plan",
  total: "Total",
  cancelButton: "Cancel",
  subscribeButton: "Change plan",
  perMonth: "per month",
  perYear: "per year",
  popular: "Most Popular",
  current: "Current",
  business: "Business",
};

export const planBadgeConfig: Record<
  NonNullable<PlanBadgeType>,
  {
    icon?: React.ComponentType;
    color?:
      | "blue"
      | "green"
      | "gray"
      | "orange"
      | "red"
      | "yellow"
      | "purple"
      | "sky"
      | "pink"
      | "teal";
  } | null
> = {
  popular: { icon: RiStarFill, color: "blue" },
  current: { color: "green" },
  business: { color: "orange" },
  custom: null,
};
