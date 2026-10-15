"use client";

import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/auth-client";

export function useOrganizationInviteMember() {
  return useMutation<
    void,
    Error,
    {
      email: string;
      organizationId: string;
      role: "owner" | "admin" | "member";
      resend?: boolean;
    }
  >({
    mutationFn: async ({ email, organizationId, role, resend }) => {
      const { error } = await authClient.organization.inviteMember({
        email,
        organizationId,
        role,
        resend,
      });
      if (error) {
        throw new Error(error.message);
      }
    },
  });
}
