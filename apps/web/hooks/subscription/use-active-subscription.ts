"use client";

import type { Subscription } from "@better-auth/stripe";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/auth-client";

export function useActiveSubscription(referenceId?: string) {
  return useQuery<Subscription[], Error, Subscription | null>({
    queryKey: ["subscription", "list", referenceId ?? null],
    queryFn: async () => {
      const { data, error } = await authClient.subscription.list(
        referenceId ? { query: { referenceId } } : undefined,
      );
      if (error) {
        throw new Error(error.message);
      }
      return data as Subscription[];
    },
    select: (subs) =>
      subs.find(
        (sub) => sub.status === "active" || sub.status === "trialing",
      ) ?? null,
    staleTime: 1000 * 60 * 5,
  });
}
