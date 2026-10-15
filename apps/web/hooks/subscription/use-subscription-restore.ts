"use client";

import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/auth-client";

export function useSubscriptionRestore() {
  return useMutation<
    void,
    Error,
    { referenceId?: string; subscriptionId?: string }
  >({
    mutationFn: async ({ referenceId, subscriptionId }) => {
      const { error } = await authClient.subscription.restore({
        referenceId,
        subscriptionId,
      });
      if (error) {
        throw new Error("Failed to restore subscription");
      }
    },
    meta: {
      invalidateQueries: [["subscription", "list"]],
    },
  });
}
