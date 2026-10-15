"use client";

import { RiInformationFill } from "@repo/ui/icon";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { SubscriptionModal } from "@/components/subscription/subscription-modal";
import { UserSubscriptionStatus } from "@/components/subscription/user-subscription-status";
import * as Alert from "@repo/ui/alert";
import * as Divider from "@repo/ui/divider";
import { Skeleton } from "@repo/ui/skeleton";
import { useCurrentPath } from "@/hooks/use-current-path";
import { authClient } from "@/lib/auth/auth-client";
import { useActiveSubscription } from "@/hooks/subscription/use-active-subscription";

export default function Plan() {
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const currentPath = useCurrentPath();

  const { data: organization } = useQuery({
    queryKey: ["organization", "full-organization"],
    queryFn: async () => {
      const { data, error } =
        await authClient.organization.getFullOrganization();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
  });

  const {
    data: subscription,
    isLoading,
    error,
  } = useActiveSubscription(organization?.id);

  const handleUpgrade = () => {
    setIsSubscriptionModalOpen(true);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div>
        <div className="text-label-md">Plan & Billing</div>
        <p className="mt-1 text-paragraph-sm text-text-sub-600">
          Manage your organization&apos;s subscription and billing information
        </p>
      </div>

      <Divider.Root variant="line-spacing" />

      <div className="space-y-8">
        <div className="flex flex-col gap-2">
          {isLoading || error || subscription === undefined ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <UserSubscriptionStatus
              onUpgrade={handleUpgrade}
              organizationId={organization?.id}
              subscription={subscription}
            />
          )}

          {!(subscription || isLoading) && (
            <Alert.Root
              className="mt-2"
              size="xsmall"
              status="information"
              variant="lighter"
            >
              <Alert.Icon as={RiInformationFill} />
              Upgrade to a paid plan to unlock all features and premium support
            </Alert.Root>
          )}

          {subscription?.cancelAtPeriodEnd && (
            <Alert.Root size="xsmall" status="warning" variant="lighter">
              <Alert.Icon as={RiInformationFill} />
              Your subscription is set to cancel at the end of the current
              billing period
            </Alert.Root>
          )}
        </div>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        cancelUrl={currentPath}
        currentSubscription={subscription}
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        referenceId={organization?.id}
        successUrl={currentPath}
      />
    </div>
  );
}
