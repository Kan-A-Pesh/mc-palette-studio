"use client";

import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useCallback, useMemo } from "react";
import { z } from "zod";

import { RoleFilter } from "@/app/(application)/admin/users/_components/filters/role-filter";
import { StatusFilter } from "@/app/(application)/admin/users/_components/filters/status-filter";
import { adminUsersParsers } from "@/app/(application)/admin/users/search-params";
import { ClearFiltersButton, SearchInput } from "@repo/ui/table";
import { useSearchInput } from "@/hooks/use-search-input";
import { PAGES } from "@/constants/pages";

const waitlistStatusSchema = z.union([
  z.literal("approved"),
  z.literal("pending"),
  z.literal("rejected"),
  z.literal("all"),
]);

const roleSchema = z.union([
  z.literal("admin"),
  z.literal("user"),
  z.literal("all"),
  z.literal(""),
]);

export function Filters() {
  const router = useRouter();

  const [search, setSearch] = useQueryState("search", adminUsersParsers.search);
  const [waitlistStatus, setWaitlistStatus] = useQueryState(
    "waitlistStatus",
    adminUsersParsers.waitlistStatus,
  );
  const [role, setRole] = useQueryState("role", adminUsersParsers.role);

  const {
    inputValue,
    setInputValue,
    isSearching,
    handleInputChange,
    clearSearch,
  } = useSearchInput({ search, setSearch });

  const hasActiveFilters = useMemo(() => {
    return !!(
      search ||
      (waitlistStatus && waitlistStatus !== "all") ||
      (role && role !== "all")
    );
  }, [search, waitlistStatus, role]);

  const handleWaitlistStatusChange = useCallback(
    (value: string) => {
      const parsedValue = waitlistStatusSchema.safeParse(value);
      if (parsedValue.success) {
        setWaitlistStatus(parsedValue.data);
      }
    },
    [setWaitlistStatus],
  );

  const handleRoleChange = useCallback(
    (value: string) => {
      const parsedValue = roleSchema.safeParse(value);
      if (parsedValue.success) {
        if (parsedValue.data === "" || parsedValue.data === "all") {
          setRole(null);
        } else {
          setRole(parsedValue.data);
        }
      }
    },
    [setRole],
  );

  const clearAllFilters = useCallback(() => {
    setInputValue("");
    router.push(PAGES.ADMIN.USERS);
  }, [router, setInputValue]);

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
          value={inputValue}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <ClearFiltersButton
          disabled={!hasActiveFilters}
          onClick={clearAllFilters}
        />

        <StatusFilter
          onValueChange={handleWaitlistStatusChange}
          value={waitlistStatus}
        />

        <RoleFilter onValueChange={handleRoleChange} value={role} />
      </div>
    </div>
  );
}
