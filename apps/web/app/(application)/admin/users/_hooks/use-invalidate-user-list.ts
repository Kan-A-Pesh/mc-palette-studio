import { useQueryClient } from "@tanstack/react-query";

import { orpc } from "@/orpc/client";

export function useInvalidateUserList() {
  const queryClient = useQueryClient();

  const invalidateUsersList = () => {
    queryClient.invalidateQueries({
      queryKey: orpc.auth.listUsers.key(),
    });
  };

  return invalidateUsersList;
}
