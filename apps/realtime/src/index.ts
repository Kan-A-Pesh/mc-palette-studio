import "@repo/env/load-env";

import type { RealtimeServer } from "@repo/realtime/server";

let server: RealtimeServer | null = null;

async function bootstrap(): Promise<void> {
  const { createApp, shutdown } = await import("./app");

  server = createApp();
  server.start();

  process.on("SIGINT", () => void shutdown(server));
  process.on("SIGTERM", () => void shutdown(server));
}

bootstrap().catch((error) => {
  console.error("[realtime] Bootstrap failed:", error);
  process.exit(1);
});
