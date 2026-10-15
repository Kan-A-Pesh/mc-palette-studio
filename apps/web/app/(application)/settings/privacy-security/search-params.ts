import { createSearchParamsCache, parseAsString } from "nuqs/server";

export const tabParsers = {
  tab: parseAsString.withDefault("change-password"),
};

export const searchParamsCache = createSearchParamsCache(tabParsers);
