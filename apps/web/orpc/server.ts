import "server-only";

import { createRouterClient } from "@orpc/server";
import { headers } from "next/headers";
import { db } from "@repo/database";
import { getServerSession } from "@/lib/auth/get-server-session";
import { appRouter } from "@repo/server";

globalThis.$client = createRouterClient(appRouter, {
  /**
   * Provide initial context if needed.
   *
   * Because this client instance is shared across all requests,
   * only include context that's safe to reuse globally.
   * For per-request context, use middleware context or pass a function as the initial context.
   */
  context: async () => ({
    headers: await headers(),
    db,
  }),
});

export const api = createRouterClient(appRouter, {
  context: async () => ({
    headers: await headers(),
    db,
    session: await getServerSession(),
  }),
});
