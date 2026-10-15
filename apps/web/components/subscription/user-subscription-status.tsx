"use client";

import type { Subscription } from "@better-auth/stripe";
import {
  RiBuildingFill,
  RiStarLine,
  RiTimeLine,
  RiVipCrownFill,
} from "@repo/ui/icon";
import { useState } from "react";
import { ConfirmationDialog } from "@repo/ui/custom/confirmation-dialog";
import * as Badge from "@repo/ui/badge";
import * as Button from "@repo/ui/button";
import { PLANS_LABELS, SUBSCRIPTION_PLANS } from "@repo/database/stripe";
import { useSubscriptionCancel } from "@/hooks/subscription/use-subscription-cancel";
import { useSubscriptionRestore } from "@/hooks/subscription/use-subscription-restore";
import { cn } from "@repo/ui/utils/cn";
import { toast } from "@repo/ui/toast";

type UserSubscriptionStatusProps = {
  subscription: Subscription | null;
  onUpgrade: () => void;
  organizationId?: string;
};

export function UserSubscriptionStatus({
  subscription,
  onUpgrade,
  organizationId,
}: UserSubscriptionStatusProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const calculateDaysRemaining = (endDate: Date | null) => {
    if (!endDate) {
      return 0;
    }

    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  };

  const handleCancel = () => {
    setConfirmOpen(true);
  };

  const cancelMutation = useSubscriptionCancel();
  const restoreMutation = useSubscriptionRestore();

  const confirmCancel = async () => {
    setIsLoading(true);
    try {
      await cancelMutation.mutateAsync({
        returnUrl: window.location.href,
        referenceId: organizationId,
        subscriptionId: subscription?.id,
      });
    } catch {
      toast.error("Failed to cancel subscription");
    }
    setIsLoading(false);
    setConfirmOpen(false);
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      await restoreMutation.mutateAsync({
        referenceId: organizationId,
        subscriptionId: subscription?.id,
      });
    } catch {
      toast.error("Failed to restore subscription");
    }
    setIsLoading(false);
  };

  if (!subscription) {
    return (
      <div className="rounded-xl bg-bg-white-0 p-4 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset transition duration-200 ease-out">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex size-10 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset">
              <RiStarLine className="size-5 text-text-sub-600" />
            </div>

            <div className="flex-1">
              <div className="text-label-sm text-text-strong-950">
                {PLANS_LABELS[SUBSCRIPTION_PLANS.FREE]}
              </div>
              <div className="mt-1 text-paragraph-xs text-text-sub-600">
                You&apos;re currently on the Free plan.
              </div>
            </div>
          </div>

          <Button.Root
            className="w-full"
            onClick={onUpgrade}
            size="small"
            variant="primary"
          >
            Upgrade Plan
          </Button.Root>
        </div>
      </div>
    );
  }

  const formattedDate = subscription.periodEnd
    ? new Date(subscription.periodEnd).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  const getPlanIcon = () => {
    switch (subscription.plan?.toLowerCase()) {
      case SUBSCRIPTION_PLANS.PRO:
        return RiVipCrownFill;
      case SUBSCRIPTION_PLANS.ENTERPRISE:
        return RiBuildingFill;
      default:
        return RiStarLine;
    }
  };

  const planId =
    (subscription.plan?.toLowerCase() as keyof typeof PLANS_LABELS) ||
    SUBSCRIPTION_PLANS.FREE;
  const planLabel = PLANS_LABELS[planId] || subscription.plan || "Unknown Plan";

  const PlanIcon = getPlanIcon();
  const isActive = subscription.status === "active";

  return (
    <div
      className={cn(
        "rounded-xl bg-bg-white-0 p-4 shadow-regular-xs ring-1 ring-inset transition duration-200 ease-out",
        isActive ? "ring-primary-base" : "ring-stroke-soft-200",
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset",
              isActive ? "ring-primary-base" : "ring-stroke-soft-200",
            )}
          >
            <PlanIcon
              className={cn(
                "size-5",
                isActive ? "text-primary-600" : "text-text-sub-600",
              )}
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="text-label-sm text-text-strong-950">
                {planLabel}
              </div>

              {subscription.status !== "active" && (
                <Badge.Root
                  color={subscription.status === "trialing" ? "blue" : "orange"}
                  size="small"
                  variant="lighter"
                >
                  {subscription.status === "trialing" ? "Trial" : "Canceled"}
                </Badge.Root>
              )}
            </div>

            <div className="mt-1 flex items-center gap-1.5 text-paragraph-xs text-text-sub-600">
              <RiTimeLine className="size-4 text-text-soft-400" />
              {subscription.cancelAtPeriodEnd ? (
                <span className="text-amber-600 dark:text-amber-400">
                  Cancels on {formattedDate}
                </span>
              ) : (
                <span>Renews on {formattedDate}</span>
              )}
            </div>

            {subscription.status === "trialing" && (
              <div className="mt-1 text-blue-600 text-paragraph-xs dark:text-blue-400">
                {subscription.periodEnd
                  ? `${calculateDaysRemaining(
                      subscription.periodEnd,
                    )} day(s) remaining in your trial`
                  : "Your trial is active"}
              </div>
            )}
          </div>
        </div>

        <div className="grid w-full grid-cols-2 gap-3">
          {subscription.cancelAtPeriodEnd ? (
            <>
              <Button.Root
                className="w-full"
                disabled={isLoading}
                mode="stroke"
                onClick={handleRestore}
                size="small"
                variant="neutral"
              >
                Reactivate
              </Button.Root>
              <Button.Root
                className="w-full"
                disabled={isLoading}
                onClick={onUpgrade}
                size="small"
                variant="primary"
              >
                Upgrade
              </Button.Root>
            </>
          ) : (
            <>
              <Button.Root
                className="w-full"
                disabled={isLoading}
                mode="stroke"
                onClick={handleCancel}
                size="small"
                variant="neutral"
              >
                Cancel Plan
              </Button.Root>
              <Button.Root
                className="w-full"
                disabled={isLoading}
                onClick={onUpgrade}
                size="small"
                variant="primary"
              >
                Upgrade
              </Button.Root>
            </>
          )}
        </div>

        <ConfirmationDialog
          cancelText="Cancel"
          confirmText="Confirm cancellation"
          description="Are you sure you want to cancel your subscription? You will retain access until the end of the billing period."
          isLoading={isLoading}
          onConfirm={confirmCancel}
          onOpenChange={setConfirmOpen}
          open={confirmOpen}
          title="Cancel subscription"
        />
      </div>
    </div>
  );
}
