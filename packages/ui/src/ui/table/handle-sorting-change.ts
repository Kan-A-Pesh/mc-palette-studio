import type { SortingState } from "@tanstack/react-table";
import { sortingStateToQueryParams } from "./sorting-state-to-query-params";

// Helper function to handle sorting changes in tables
export function handleSortingChange<T extends string>({
  updaterOrValue,
  currentSorting,
  setSortBy,
  setSortOrder,
  setPage,
  currentPage,
}: {
  updaterOrValue: SortingState | ((state: SortingState) => SortingState);
  currentSorting: SortingState;
  setSortBy: (value: T | null) => void;
  setSortOrder: (value: "asc" | "desc" | null) => void;
  setPage: (value: number | null) => void;
  currentPage?: number | null;
}) {
  // Determine the new sorting state
  let newSorting: SortingState;
  if (typeof updaterOrValue === "function") {
    newSorting = updaterOrValue(currentSorting);
  } else {
    newSorting = updaterOrValue;
  }

  // Convert the sorting state to query parameters
  const { sortBy: newSortBy, sortOrder: newSortOrder } =
    sortingStateToQueryParams<T>(newSorting);

  // Update query params to trigger data fetch with new sort
  setSortBy(newSortBy);
  setSortOrder(newSortOrder);

  // Reset to page 1 when sorting changes
  if (currentPage && currentPage > 1) {
    setPage(1);
  }
}
