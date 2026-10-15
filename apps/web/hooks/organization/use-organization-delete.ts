"use client";

import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/auth-client";

export function useOrganizationDelete() {
  return useMutation<void, Error, { organizationId: string }>({
    mutationFn: async ({ organizationId }) => {
      const { error } = await authClient.organization.delete({
        organizationId,
      });
      if (error) {
        throw new Error(error.message);
      }
    },
  });
}
