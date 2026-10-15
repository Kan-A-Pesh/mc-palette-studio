import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

import { CursorLoader } from "@repo/ui/cursor-loader";

import PrivacySecurityTabs from "./_components/privacy-security-tabs";
import { searchParamsCache } from "./search-params";

type PagePrivacySecurityProps = {
  searchParams: Promise<SearchParams>;
};

export default async function PrivacySecurityPage({
  searchParams,
}: PagePrivacySecurityProps) {
  // Parse search params
  await searchParamsCache.parse(searchParams);

  return (
    <Suspense fallback={<CursorLoader />}>
      <PrivacySecurityTabs />
    </Suspense>
  );
}
