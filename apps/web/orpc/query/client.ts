import {
  defaultShouldDehydrateQuery,
  MutationCache,
  QueryClient,
} from "@tanstack/react-query";
import { serializer } from "../serializer";

export function createQueryClient() {
  const queryClient = new QueryClient({
    mutationCache: new MutationCache({
      onSettled(_data, _error, _variables, _context, mutation) {
        if (mutation.meta?.invalidateQueries) {
          for (const queryKey of mutation.meta.invalidateQueries) {
            queryClient.invalidateQueries({ queryKey });
          }
        }
      },
    }),
    defaultOptions: {
      queries: {
        queryKeyHashFn(queryKey) {
          const [json, meta] = serializer.serialize(queryKey);
          return JSON.stringify({ json, meta });
        },
        staleTime: 60 * 1000, // > 0 to prevent immediate refetching on mount
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
        serializeData(data) {
          const [json, meta] = serializer.serialize(data);
          return { json, meta };
        },
      },
      hydrate: {
        deserializeData(data) {
          return serializer.deserialize(data.json, data.meta);
        },
      },
    },
  });

  return queryClient;
}
