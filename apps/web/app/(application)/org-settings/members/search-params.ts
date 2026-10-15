import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";

export const membersParsers = {
  // Filters
  tab: parseAsString.withDefault("all"),
  search: parseAsString.withDefault(""),

  // Pagination
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(25),
};

export const searchParamsCache = createSearchParamsCache(membersParsers);
