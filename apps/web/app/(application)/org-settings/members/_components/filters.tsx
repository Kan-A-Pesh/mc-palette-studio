"use client";

import { useQueryState } from "nuqs";

import { SearchInput } from "@repo/ui/table";
import * as SegmentedControl from "@repo/ui/segmented-control";

import { useSearchInput } from "@/hooks/use-search-input";
import { membersParsers } from "../search-params";

export default function Filters() {
  // Query state
  const [tab, setTab] = useQueryState("tab", membersParsers.tab);
  const [search, setSearch] = useQueryState("search", membersParsers.search);

  const { inputValue, isSearching, handleInputChange, clearSearch } =
    useSearchInput({ search, setSearch, clearEmpty: true });

  return (
    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3">
      <SearchInput
        className="lg:hidden"
        isSearching={isSearching}
        onChange={handleInputChange}
        onClear={clearSearch}
        placeholder="Search"
        value={inputValue}
      />

      <div className="hidden flex-wrap gap-3 lg:flex min-[560px]:flex-nowrap">
        <SearchInput
          className="w-75"
          isSearching={isSearching}
          onChange={handleInputChange}
          onClear={clearSearch}
          placeholder="Search"
          size="small"
          value={inputValue}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <SegmentedControl.Root
          className="xl:w-80"
          onValueChange={setTab}
          value={tab || "all"}
        >
          <SegmentedControl.List>
            <SegmentedControl.Trigger value="all">All</SegmentedControl.Trigger>
            <SegmentedControl.Trigger value="members">
              Members
            </SegmentedControl.Trigger>
            <SegmentedControl.Trigger value="invited">
              Invited
            </SegmentedControl.Trigger>
          </SegmentedControl.List>
        </SegmentedControl.Root>
      </div>
    </div>
  );
}
