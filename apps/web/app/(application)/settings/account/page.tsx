import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

import { CursorLoader } from "@repo/ui/cursor-loader";
import { orpc } from "@/orpc/client";
import { getQueryClient, HydrateClient } from "@/orpc/query/hydration";
import AccountSettingsTabs from "./_components/account-settings-tabs";
import { searchParamsCache } from "./search-params";

type PageAccountSettingsProps = {
  searchParams: Promise<SearchParams>;
};

export default async function AccountPage({
  searchParams,
}: PageAccountSettingsProps) {
  await searchParamsCache.parse(searchParams);
  const queryClient = getQueryClient();

  queryClient.prefetchQuery(orpc.user.getMe.queryOptions());

  return (
    <HydrateClient client={queryClient}>
      <Suspense fallback={<CursorLoader />}>
        <AccountSettingsTabs />
      </Suspense>
    </HydrateClient>
  );
}
