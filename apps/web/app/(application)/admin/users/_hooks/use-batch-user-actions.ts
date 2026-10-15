import { useMutation } from "@tanstack/react-query";
import { toast } from "@repo/ui/toast";

import { orpc } from "@/orpc/client";

export function useBatchUserActions() {
  const { mutateAsync: banMutipleUsersMutation } = useMutation(
    orpc.auth.banMultipleUsers.mutationOptions({
      meta: {
        invalidateQueries: [orpc.auth.listUsers.key()],
      },
    }),
  );

  const handleBanMultipleUsers = (userIds: string[]) => {
    if (!userIds.length) {
      return;
    }

    toast.promise(
      banMutipleUsersMutation({
        userIds,
      }),
      {
        loading: "Banning users...",
        success: "Users banned successfully",
        error: "Failed to ban users",
      },
    );
  };

  return {
    banMultipleUsers: handleBanMultipleUsers,
  };
}
