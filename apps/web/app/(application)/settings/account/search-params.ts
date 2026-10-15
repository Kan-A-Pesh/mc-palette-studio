import { createSearchParamsCache, parseAsString } from "nuqs/server";

export const tabParsers = {
  tab: parseAsString.withDefault("myAccount"),
};

export const searchParamsCache = createSearchParamsCache(tabParsers);
