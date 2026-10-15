import {
  createRealtimeEmitter,
  type RealtimeEmitter,
} from "@repo/realtime/internal";
import type { ServerEventName, ServerEventInput } from "@repo/realtime/events";
import { env } from "@repo/env/apps-web";
import { resolveRealtimeTcpUrl } from "@repo/env/apps-web/railway-endpoints";

function createEmitter(): RealtimeEmitter | null {
  const tcpUrl = resolveRealtimeTcpUrl(env.REALTIME_TCP_URL);

  if (!tcpUrl || !env.REALTIME_SECRET_KEY) {
    console.warn(
      "[realtime] REALTIME_TCP_URL or REALTIME_SECRET_KEY not configured. Realtime disabled.",
    );
    return null;
  }

  const url = new URL(tcpUrl);

  return createRealtimeEmitter({
    host: url.hostname,
    port: parseInt(url.port || "9000"),
    secretKey: env.REALTIME_SECRET_KEY,
  });
}

const emitter = createEmitter();

export const realtime = {
  emit: async <E extends ServerEventName>(
    event: E,
    data: ServerEventInput<E>,
  ): Promise<boolean> => {
    if (!emitter) {
      console.warn("[realtime] Emitter not configured, skipping emit");
      return false;
    }
    return emitter.emit(event, data);
  },

  isConfigured: (): boolean => emitter !== null,
};
