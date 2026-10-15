import type { SearchParams } from "nuqs/server";
import { orpc } from "@/orpc/client";
import { getQueryClient, HydrateClient } from "@/orpc/query/hydration";
import GeneralTabs from "./_components/general-tabs";
import { searchParamsCache } from "./search-params";

type PageGeneralSettingsProps = {
  searchParams: Promise<SearchParams>;
};

export default async function GeneralPage({
  searchParams,
}: PageGeneralSettingsProps) {
  await searchParamsCache.parse(searchParams);
  const queryClient = getQueryClient();

  queryClient.prefetchQuery(
    orpc.organization.getActiveOrganization.queryOptions(),
  );

  queryClient.prefetchQuery(orpc.organization.getActiveMember.queryOptions());

  return (
    <HydrateClient client={queryClient}>
      <GeneralTabs />
    </HydrateClient>
  );
}
