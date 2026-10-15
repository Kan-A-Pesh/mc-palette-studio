import { env } from "@repo/env/apps-web";
import { resolveRealtimeWebSocketUrl } from "@repo/env/apps-web/railway-endpoints";

export function getRealtimeWebSocketUrl(): string {
  return resolveRealtimeWebSocketUrl(env.NEXT_PUBLIC_REALTIME_WS_URL);
}
