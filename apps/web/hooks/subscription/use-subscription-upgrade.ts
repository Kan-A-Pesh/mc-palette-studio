"use client";

import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/auth-client";

export function useSubscriptionUpgrade() {
  return useMutation<
    void,
    Error,
    {
      plan: string;
      annual?: boolean;
      successUrl: string;
      cancelUrl: string;
      subscriptionId?: string;
      referenceId?: string;
    }
  >({
    mutationFn: async (vars) => {
      const { error } = await authClient.subscription.upgrade(vars);
      if (error) {
        throw new Error("Failed to upgrade subscription");
      }
    },
  });
}
