"use client";

import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/auth-client";

export function useOrganizationLeave() {
  return useMutation<void, Error, { organizationId: string }>({
    mutationFn: async ({ organizationId }) => {
      const { error } = await authClient.organization.leave({
        organizationId,
      });
      if (error) {
        throw new Error(error.message);
      }
    },
  });
}
