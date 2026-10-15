import { createSearchParamsCache, parseAsString } from "nuqs/server";

export const tabParsers = {
  tab: parseAsString.withDefault("details"),
};

export const searchParamsCache = createSearchParamsCache(tabParsers);
