import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

import { CursorLoader } from "@repo/ui/cursor-loader";

import Filters from "./_components/filters";
import MembersTable from "./_components/members-table";
import { searchParamsCache } from "./search-params";

type MemberSettingsPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function MembersPage({
  searchParams,
}: MemberSettingsPageProps) {
  await searchParamsCache.parse(searchParams);

  return (
    <Suspense fallback={<CursorLoader />}>
      <div className="flex w-full flex-1 flex-col gap-4">
        <Filters />
        <MembersTable />
      </div>
    </Suspense>
  );
}
