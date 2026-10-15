import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { BatchLinkPlugin, DedupeRequestsPlugin } from "@orpc/client/plugins";
import type { RouterClient } from "@orpc/server";
import type { appRouter } from "@repo/server";
// This import is required for TypeScript to emit valid .d.ts declarations.
// Without it, exported values like `orpcClient` reference an internal
// @orpc/contract path in node_modules (TS2742). The namespace alias is unused at
// runtime but necessary for type resolution.
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- required for TS2742 declaration emit; @orpc/contract types must be reachable
import type * as _orpcContract from "@orpc/contract";

declare global {
  var $client: RouterClient<typeof appRouter> | undefined;
}

const READ_OPERATIONS_REGEX = /^(?:get|find|list|search)(?:[A-Z].*)?$/;

const link = new RPCLink({
  url: () => {
    if (typeof window === "undefined") {
      throw new Error("RPCLink is not allowed on the server side.");
    }
    return `${window.location.origin}/api/rpc`;
  },
  method: ({ context }, path) => {
    // Use GET for cached responses
    if (context?.cache) {
      return "GET";
    }

    // Use GET for rendering requests
    if (typeof window === "undefined") {
      return "GET";
    }

    // Use GET for read-like operations
    if (path.at(-1)?.match(READ_OPERATIONS_REGEX)) {
      return "GET";
    }

    return "POST";
  },
  plugins: [
    new DedupeRequestsPlugin({
      filter: ({ request }) => request.method === "GET",
      groups: [
        {
          condition: () => true,
          context: {},
        },
      ],
    }),
    new BatchLinkPlugin({
      groups: [
        {
          condition: () => true,
          context: {},
        },
      ],
    }),
  ],
});

/**
 * Fallback to client-side client if server-side client is not available.
 */
export const orpcClient: RouterClient<typeof appRouter> =
  globalThis.$client ?? createORPCClient(link);
