"use client";

import { RiCheckLine, RiErrorWarningFill } from "@repo/ui/icon";
import { AnimateNumber } from "motion-plus/react";
import * as React from "react";

import * as Accordion from "@repo/ui/accordion";
import * as Alert from "@repo/ui/alert";
import * as Button from "@repo/ui/button";
import * as Radio from "@repo/ui/radio";
import * as SegmentedControl from "@repo/ui/segmented-control";
import { cn } from "@repo/ui/utils/cn";

import { StaggeredFadeLoader } from "@repo/ui/custom/staggered-fade-loader";
import { PlanDetails, PlanInterval } from "@repo/database/stripe";

import PlanBadge from "./plan-badge";
import PlanRadioIndicator from "./plan-radio-indicator";
import { defaultLabels } from "./plans-constants";

type PlansProps = {
  plans: PlanDetails[];
  defaultInterval?: PlanInterval;
  defaultSelectedPlanId?: string;
  onPlanChange?: (planId: string, interval: PlanInterval) => void;
  onSubscribe?: (planId: string, interval: PlanInterval) => void;
  currentPlanId?: string;
  isLoading?: boolean;
  error?: string | null;
  onClose?: () => void;
  labels?: {
    title?: string;
    monthly?: string;
    yearly?: string;
    summary?: string;
    currentPlan?: string;
    newPlan?: string;
    total?: string;
    cancelButton?: string;
    subscribeButton?: string;
    perMonth?: string;
    perYear?: string;
    popular?: string;
    current?: string;
    business?: string;
  };
};

export default function Plans({
  plans,
  defaultInterval = "yearly",
  defaultSelectedPlanId,
  onPlanChange,
  onSubscribe,
  currentPlanId,
  isLoading = false,
  error = null,
  labels: customLabels = {},
  onClose,
}: PlansProps) {
  const labels = { ...defaultLabels, ...customLabels };
  const [billingInterval, setBillingInterval] =
    React.useState<PlanInterval>(defaultInterval);
  const initialSelectedPlanId =
    defaultSelectedPlanId ?? plans[1]?.id ?? plans[0]?.id ?? "";
  const [selectedPlanId, setSelectedPlanId] = React.useState<string>(
    initialSelectedPlanId,
  );

  const [expandedValues, setExpandedValues] = React.useState<string[]>([
    initialSelectedPlanId,
  ]);

  const currentPlan = currentPlanId
    ? plans.find((plan) => plan.id === currentPlanId)
    : null;

  const selectedPlan =
    plans.find((plan) => plan.id === selectedPlanId) || plans[0]!;

  const handleIntervalChange = (value: string) => {
    const interval = value as PlanInterval;
    setBillingInterval(interval);
    onPlanChange?.(selectedPlanId, interval);
  };

  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
    onPlanChange?.(planId, billingInterval);
  };

  const handleSubscribe = () => {
    onSubscribe?.(selectedPlanId, billingInterval);
  };

  const getPlanPrice = (plan: PlanDetails, interval: PlanInterval) => {
    return interval === "monthly" ? plan.priceMonthly : plan.priceYearly;
  };

  const getIntervalLabel = (interval: PlanInterval) => {
    return interval === "monthly" ? labels.perMonth : labels.perYear;
  };

  const handleAccordionValueChange = (value: string) => {
    setExpandedValues([value]);
    if (value) {
      handlePlanChange(value);
    }
  };

  return (
    <div className="w-full max-w-213 rounded-3xl bg-bg-white-0 shadow-custom-md">
      <div className="flex flex-col md:flex-row">
        {/* Left Section */}
        <div className="flex w-full flex-col gap-5 p-5 md:max-w-120 md:border-stroke-soft-200 md:border-r">
          <div className="flex items-center justify-between gap-5">
            <h2 className="text-label-lg text-text-strong-950">
              {labels.title}
            </h2>
            <SegmentedControl.Root
              className="shrink-0"
              defaultValue={billingInterval}
              onValueChange={handleIntervalChange}
              value={billingInterval}
            >
              <SegmentedControl.List>
                <SegmentedControl.Trigger
                  className="max-h-6 max-w-19 px-badge-x transition-shadow duration-300 data-[state=active]:shadow-custom-xs"
                  value="monthly"
                >
                  <span
                    className={cn(
                      "text-label-sm",
                      billingInterval === "monthly"
                        ? "text-text-sub-600"
                        : "text-text-soft-400",
                    )}
                  >
                    {labels.monthly}
                  </span>
                </SegmentedControl.Trigger>
                <SegmentedControl.Trigger
                  className="max-h-6 max-w-19 px-badge-x transition-shadow duration-300 data-[state=active]:shadow-custom-xs"
                  value="yearly"
                >
                  <span
                    className={cn(
                      "text-label-sm",
                      billingInterval === "yearly"
                        ? "text-text-sub-600"
                        : "text-text-soft-400",
                    )}
                  >
                    {labels.yearly}
                  </span>
                </SegmentedControl.Trigger>
              </SegmentedControl.List>
            </SegmentedControl.Root>
          </div>

          {/* Hidden Radio Group for accessibility and state management */}
          <div className="sr-only">
            <Radio.Group
              onValueChange={handlePlanChange}
              value={selectedPlanId}
            >
              {plans.map((plan) => (
                <Radio.Item
                  id={`radio-${plan.id}`}
                  key={`radio-${plan.id}`}
                  value={plan.id}
                />
              ))}
            </Radio.Group>
          </div>

          <Accordion.Root
            className="space-y-2"
            collapsible={false}
            onValueChange={handleAccordionValueChange}
            type="single"
            value={expandedValues[0]}
          >
            {plans.map((plan) => (
              <Accordion.Item
                className={cn(
                  "rounded-2xl transition-all duration-200",
                  selectedPlanId === plan.id
                    ? "!ring-primary-base bg-primary-lighter"
                    : "",
                )}
                key={plan.id}
                value={plan.id}
              >
                <Accordion.Header>
                  <Accordion.Trigger className="flex justify-between pr-2">
                    <div className="flex items-center gap-3">
                      {/* Custom radio indicator that matches the Radio component design */}
                      <PlanRadioIndicator
                        planId={plan.id}
                        selected={selectedPlanId === plan.id}
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-label-sm text-text-strong-950">
                            {plan.name}
                          </span>
                          {plan.badge && <PlanBadge type={plan.badge} />}
                        </div>
                        <div className="text-paragraph-sm text-text-sub-600">
                          {plan.description}
                        </div>
                      </div>
                    </div>
                    <div className="pr-2 text-right text-label-sm text-text-sub-600">
                      {"$"}
                      <AnimateNumber
                        className="inline"
                        transition={{
                          visualDuration: 0.4,
                          type: "spring",
                          bounce: 0.2,
                        }}
                      >
                        {getPlanPrice(plan, billingInterval)}
                      </AnimateNumber>{" "}
                      {getIntervalLabel(billingInterval)}
                    </div>
                  </Accordion.Trigger>
                </Accordion.Header>

                {plan.features.length > 0 && (
                  <Accordion.Content>
                    <ul className="space-y-2 pb-3 pl-10">
                      {plan.features.map((feature) => (
                        <li
                          className="flex items-center gap-2 text-paragraph-sm text-text-sub-600"
                          key={feature.id}
                        >
                          {feature.included ? (
                            <RiCheckLine className="h-4 w-4 text-success-500" />
                          ) : (
                            <span className="h-4 w-4" />
                          )}
                          {feature.name}
                        </li>
                      ))}
                    </ul>
                  </Accordion.Content>
                )}
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>

        {/* Right Section */}
        <div className="w-full flex-1 p-5 md:max-w-93">
          <div className="flex h-full flex-col justify-between gap-5">
            <div className="flex w-full flex-col gap-5">
              <h3 className="text-label-lg text-text-strong-950">
                {labels.summary}
              </h3>
              <div className="flex w-full flex-col gap-4">
                {currentPlan && (
                  <div className="flex justify-between text-text-sub-600">
                    <span className="text-label-sm text-text-soft-400">
                      {labels.currentPlan}
                    </span>
                    <span className="text-label-sm text-text-soft-400">
                      {"$"}
                      <AnimateNumber
                        className="inline"
                        transition={{
                          visualDuration: 0.4,
                          type: "spring",
                          bounce: 0.2,
                        }}
                      >
                        {getPlanPrice(currentPlan, billingInterval)}
                      </AnimateNumber>{" "}
                      {getIntervalLabel(billingInterval)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-text-sub-600">
                  <span className="text-label-sm text-text-sub-600">
                    {labels.newPlan}
                  </span>
                  <span className="text-label-sm text-text-sub-600 transition-all duration-200">
                    {"$"}
                    <AnimateNumber
                      className="inline"
                      transition={{
                        visualDuration: 0.4,
                        type: "spring",
                        bounce: 0.2,
                      }}
                    >
                      {getPlanPrice(selectedPlan, billingInterval)}
                    </AnimateNumber>{" "}
                    {getIntervalLabel(billingInterval)}
                  </span>
                </div>
                <div className="flex justify-between border-stroke-soft-200 border-t pt-4 font-medium">
                  <span className="text-label-sm text-text-sub-600">
                    {labels.total}
                  </span>
                  <span className="text-label-sm text-text-sub-600 transition-all duration-200">
                    {"$"}
                    <AnimateNumber
                      className="inline font-medium"
                      transition={{
                        visualDuration: 0.4,
                        type: "spring",
                        bounce: 0.2,
                      }}
                    >
                      {getPlanPrice(selectedPlan, billingInterval)}
                    </AnimateNumber>{" "}
                    {getIntervalLabel(billingInterval)}
                  </span>
                </div>
              </div>
              {error && (
                <Alert.Root status="error" variant="lighter">
                  <Alert.Icon as={RiErrorWarningFill} />
                  {error}
                </Alert.Root>
              )}
            </div>

            <div className="flex w-full justify-end gap-3">
              <Button.Root
                className="rounded-10"
                mode="stroke"
                onClick={onClose}
                size="small"
                variant="neutral"
              >
                {labels.cancelButton}
              </Button.Root>
              <Button.Root
                className="relative rounded-10"
                disabled={isLoading}
                onClick={handleSubscribe}
                size="small"
                variant="primary"
              >
                <span className={cn(isLoading ? "opacity-0" : "opacity-100")}>
                  {labels.subscribeButton}
                </span>
                {isLoading && (
                  <StaggeredFadeLoader
                    className="absolute inset-0 flex items-center justify-center"
                    variant="muted"
                  />
                )}
              </Button.Root>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
