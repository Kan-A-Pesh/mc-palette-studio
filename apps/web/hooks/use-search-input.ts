"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounceValue } from "usehooks-ts";

type SetSearch = (value: string | null) => void | Promise<unknown>;

interface UseSearchInputOptions {
  /** Current persisted search value (e.g. from nuqs query state). */
  search: string | null;
  /** Setter for the persisted search value. */
  setSearch: SetSearch;
  /** Debounce delay in ms before the persisted value is updated. */
  delay?: number;
  /**
   * When the debounced input is empty, write `null` instead of "" to the
   * persisted value (clears the query param entirely).
   */
  clearEmpty?: boolean;
}

/**
 * Debounced search-input state shared by table filter bars: keeps a local
 * `inputValue`, debounces it into the persisted search param, and exposes the
 * `isSearching` flag plus the input/clear handlers.
 */
export function useSearchInput({
  search,
  setSearch,
  delay = 300,
  clearEmpty = false,
}: UseSearchInputOptions) {
  const [inputValue, setInputValue] = useState(search || "");
  const [debouncedValue, setDebouncedValue] = useDebounceValue(
    inputValue,
    delay,
  );

  const isSearching = useMemo(() => {
    return inputValue !== debouncedValue;
  }, [inputValue, debouncedValue]);

  useEffect(() => {
    setSearch(clearEmpty ? debouncedValue || null : debouncedValue);
  }, [debouncedValue, setSearch, clearEmpty]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    },
    [],
  );

  const clearSearch = useCallback(() => {
    setSearch(null);
    setInputValue("");
    setDebouncedValue("");
  }, [setSearch, setDebouncedValue]);

  return {
    inputValue,
    setInputValue,
    isSearching,
    handleInputChange,
    clearSearch,
  };
}
