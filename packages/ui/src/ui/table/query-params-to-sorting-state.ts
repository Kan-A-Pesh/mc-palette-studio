import type { SortingState } from "@tanstack/react-table";

// Helper function to convert query params to TanStack sorting state
export function queryParamsToSortingState<T extends string>(
  sortBy: T,
  sortOrder: "asc" | "desc",
): SortingState {
  return [
    {
      id: sortBy,
      desc: sortOrder === "desc",
    },
  ];
}
