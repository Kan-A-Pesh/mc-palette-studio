"use client";

import type { QueryClient } from "@tanstack/react-query";
import type { useRouter } from "next/navigation";
import { PAGES } from "@/constants/pages";
import { authClient } from "@/lib/auth/auth-client";

export async function impersonateUser(
  userId: string,
  queryClient: QueryClient,
  router: ReturnType<typeof useRouter>,
) {
  const { error } = await authClient.admin.impersonateUser({
    userId,
  });

  if (error) {
    throw error;
  }

  await queryClient.invalidateQueries({
    queryKey: [["user"]],
  });
  router.push(PAGES.APPLICATION.DASHBOARD);
  router.refresh();
}
