"use client";

import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/auth-client";

export function useSubscriptionCancel() {
  return useMutation<
    void,
    Error,
    { returnUrl: string; referenceId?: string; subscriptionId?: string }
  >({
    mutationFn: async ({ returnUrl, referenceId, subscriptionId }) => {
      const { error } = await authClient.subscription.cancel({
        returnUrl,
        referenceId,
        subscriptionId,
      });
      if (error) {
        throw new Error("Failed to cancel subscription");
      }
    },
    meta: {
      invalidateQueries: [["subscription", "list"]],
    },
  });
}
