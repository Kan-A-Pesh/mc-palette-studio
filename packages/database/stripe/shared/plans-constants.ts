export type PlanInterval = "monthly" | "yearly";

export type PlanFeature = {
  id: string;
  name: string;
  included: boolean;
};

export type PlanBadgeType =
  | "popular"
  | "current"
  | "business"
  | "custom"
  | null;

export type PlanDetails = {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: PlanFeature[];
  badge: PlanBadgeType;
  stripeMonthlyPriceId?: string;
  stripeYearlyPriceId?: string;
};

export const SUBSCRIPTION_PLANS = {
  FREE: "free",
  PRO: "pro",
  ENTERPRISE: "enterprise",
} as const;

export const PLANS_LABELS = {
  [SUBSCRIPTION_PLANS.FREE]: "Free",
  [SUBSCRIPTION_PLANS.PRO]: "Pro",
  [SUBSCRIPTION_PLANS.ENTERPRISE]: "Enterprise",
} as const;

export const SUBSCRIPTION_PLANS_DETAILS: [PlanDetails, PlanDetails] = [
  {
    id: SUBSCRIPTION_PLANS.PRO,
    name: "Pro",
    description: "For growing teams and projects",
    priceMonthly: 10,
    priceYearly: 100,
    features: [{ id: "id1", name: "The feature 1", included: true }],
    badge: null,
  },
  {
    id: SUBSCRIPTION_PLANS.ENTERPRISE,
    name: "Enterprise",
    description: "For large teams and complex projects",
    priceMonthly: 99,
    priceYearly: 990,
    features: [
      { id: "id1", name: "Enhanced feature 1!", included: true },
      { id: "id2", name: "And the feature 2", included: true },
    ],
    badge: null,
  },
];
