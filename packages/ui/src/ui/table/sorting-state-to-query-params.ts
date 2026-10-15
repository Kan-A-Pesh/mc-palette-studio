import type { SortingState } from "@tanstack/react-table";

// Helper function to convert TanStack sorting state to query params
export function sortingStateToQueryParams<T extends string>(
  sorting: SortingState,
  defaultSortBy: T = "createdAt" as T,
): {
  sortBy: T;
  sortOrder: "asc" | "desc";
} {
  if (sorting.length === 0) {
    return {
      sortBy: defaultSortBy,
      sortOrder: "desc",
    };
  }

  const column = sorting[0]!;
  return {
    sortBy: column.id as T,
    sortOrder: column.desc ? "desc" : "asc",
  };
}
