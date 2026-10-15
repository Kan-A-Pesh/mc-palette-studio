import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

const sortableColumns = ["user", "waitlistStatus", "role", "createdAt"];

export type SortableColumn = "user" | "waitlistStatus" | "role" | "createdAt";

export const adminUsersParsers = {
  // Filters
  search: parseAsString,
  role: parseAsStringEnum(["admin", "user", "all"]).withDefault("all"),
  waitlistStatus: parseAsStringEnum([
    "approved",
    "pending",
    "rejected",
    "all",
  ]).withDefault("all"),

  // Pagination
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(25),

  // Sorting
  sortBy: parseAsStringEnum(sortableColumns).withDefault("createdAt"),
  sortOrder: parseAsStringEnum(["asc", "desc"]).withDefault("desc"),
};

export const adminUsersSearchParamsCache =
  createSearchParamsCache(adminUsersParsers);
