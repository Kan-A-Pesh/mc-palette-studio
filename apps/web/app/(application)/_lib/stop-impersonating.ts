import type { QueryClient } from "@tanstack/react-query";
import type { useRouter } from "next/navigation";
import { PAGES } from "@/constants/pages";
import { authClient } from "@/lib/auth/auth-client";

export async function stopImpersonating(
  queryClient: QueryClient,
  router: ReturnType<typeof useRouter>,
) {
  await authClient.admin.stopImpersonating();
  queryClient.invalidateQueries({
    queryKey: [["user"]],
  });
  router.push(PAGES.ADMIN.USERS);
  router.refresh();
}
