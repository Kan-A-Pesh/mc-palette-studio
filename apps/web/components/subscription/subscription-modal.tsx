"use client";

import type { Subscription } from "@better-auth/stripe";
import { useMemo, useState } from "react";

import Plans from "@/components/subscription/plans";
import * as Modal from "@repo/ui/modal";
import { PAGES } from "@/constants/pages";
import { SUBSCRIPTION_PLANS_DETAILS } from "@repo/database/stripe";
import { useCurrentPath } from "@/hooks/use-current-path";
import { useSubscriptionUpgrade } from "@/hooks/subscription/use-subscription-upgrade";
import { validateRedirectUrl } from "@/lib/validate-redirect-url";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubscription?: Subscription | null;
  successUrl?: string;
  cancelUrl?: string;
  referenceId?: string;
}

export function SubscriptionModal({
  isOpen,
  onClose,
  currentSubscription,
  successUrl,
  cancelUrl,
  referenceId,
}: SubscriptionModalProps) {
  const [error, setError] = useState<string | null>(null);
  const currentPath = useCurrentPath();

  const defaultBillingUrl = `${PAGES.APPLICATION.SETTINGS.ACCOUNT}?tab=billing`;
  const finalSuccessUrl = successUrl || currentPath || defaultBillingUrl;
  const finalCancelUrl = cancelUrl || currentPath || defaultBillingUrl;

  const handlePlanChange = () => {
    setError(null);
  };

  const currentPlanId = currentSubscription?.plan;

  const displayPlans = useMemo(() => {
    const plans = SUBSCRIPTION_PLANS_DETAILS;
    const current = currentPlanId?.toLowerCase();
    if (!current) {
      return plans;
    }
    const currentIndex = plans.findIndex((p) => p.id === current);
    if (currentIndex === -1) {
      return plans;
    }
    const higher = plans.filter((_, idx) => idx > currentIndex);
    return higher.length > 0 ? higher : plans;
  }, [currentPlanId]);

  const upgradeMutation = useSubscriptionUpgrade();

  const handleSubscribe = (planId: string, interval: "monthly" | "yearly") => {
    setError(null);
    upgradeMutation.mutate(
      {
        plan: planId,
        annual: interval === "yearly",
        successUrl: validateRedirectUrl(finalSuccessUrl),
        cancelUrl: validateRedirectUrl(finalCancelUrl),
        subscriptionId: currentSubscription?.id,
        referenceId,
      },
      {
        onError: () => {
          setError("An error occurred while upgrading your subscription");
        },
      },
    );
  };

  return (
    <Modal.Root onOpenChange={onClose} open={isOpen}>
      <Modal.Content className="max-w-213 p-0">
        <Modal.Header
          className="hidden"
          description="Select the plan that best fits your needs"
          title="Choose your plan"
        />
        <Modal.Body className="p-0">
          <Plans
            currentPlanId={currentPlanId}
            defaultInterval="yearly"
            error={error}
            isLoading={upgradeMutation.isPending}
            labels={{
              subscribeButton: currentPlanId ? "Change plan" : "Upgrade",
              cancelButton: "Cancel",
            }}
            onClose={onClose}
            onPlanChange={handlePlanChange}
            onSubscribe={handleSubscribe}
            plans={displayPlans}
          />
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
