import { useQueryClient } from "@tanstack/react-query";

export function useInvalidateOrgMembers() {
  const queryClient = useQueryClient();

  const invalidateOrgMembers = () => {
    queryClient.invalidateQueries({
      queryKey: ["organization", "members"],
    });
    queryClient.invalidateQueries({
      queryKey: [["organization", "listMembers"]],
    });
  };

  return invalidateOrgMembers;
}
