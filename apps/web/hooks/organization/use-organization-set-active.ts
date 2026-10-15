"use client";

import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/auth-client";

export function useOrganizationSetActive() {
  return useMutation<void, Error, { organizationId: string | null }>({
    mutationFn: async ({ organizationId }) => {
      const { error } = await authClient.organization.setActive({
        organizationId,
      });
      if (error) {
        throw new Error(error.message);
      }
    },
  });
}
