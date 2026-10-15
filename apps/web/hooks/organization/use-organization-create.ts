"use client";

import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/auth-client";

export function useOrganizationCreate() {
  return useMutation<
    {
      data: {
        id: string;
        name: string;
        slug: string;
        [key: string]: unknown;
      };
    },
    Error,
    {
      name: string;
      slug: string;
      logo?: string;
    }
  >({
    mutationFn: async ({ name, slug, logo }) => {
      const { data, error } = await authClient.organization.create({
        name,
        slug,
        logo,
      });
      if (error) {
        throw new Error(error.message);
      }
      if (!data) {
        throw new Error("Organization creation failed");
      }
      return { data } as const;
    },
  });
}
