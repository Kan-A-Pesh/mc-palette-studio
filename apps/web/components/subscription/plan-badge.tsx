import * as Badge from "@repo/ui/badge";

import type { PlanBadgeType } from "@repo/database/stripe";

import { defaultLabels, planBadgeConfig } from "./plans-constants";

export default function PlanBadge({
  type,
  customLabel,
}: {
  type: PlanBadgeType;
  customLabel?: string;
}) {
  if (!type) {
    return null;
  }

  const labels = {
    popular: defaultLabels.popular,
    current: defaultLabels.current,
    business: defaultLabels.business,
    custom: customLabel || "",
  };

  if (type === "business") {
    return (
      <span className="text-label-sm text-text-soft-400">
        {`(${labels[type]})`}
      </span>
    );
  }

  const config = planBadgeConfig[type];

  return (
    <Badge.Root color={config?.color} size="medium" variant="lighter">
      {config?.icon && <Badge.Icon as={config.icon} />}
      {labels[type]}
    </Badge.Root>
  );
}
