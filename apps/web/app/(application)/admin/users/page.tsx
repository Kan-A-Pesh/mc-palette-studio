import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

import { CursorLoader } from "@repo/ui/cursor-loader";

import { Filters } from "./_components/filters";
import { UsersTable } from "./_components/users-table";
import { adminUsersSearchParamsCache } from "./search-params";

interface UsersPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  await adminUsersSearchParamsCache.parse(searchParams);

  return (
    <Suspense fallback={<CursorLoader />}>
      <div className="flex w-full flex-1 flex-col gap-4">
        <Filters />
        <UsersTable />
      </div>
    </Suspense>
  );
}
