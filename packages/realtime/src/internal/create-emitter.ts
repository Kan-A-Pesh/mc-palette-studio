import { createTcpClient, type TcpClient, type ConnectionConfig } from "../lib";
import type { ServerEventName, ServerEventInput } from "../events";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- distinct named config sharing the connection base; fields may diverge later
export interface RealtimeEmitterConfig extends ConnectionConfig {}

export interface RealtimeEmitter {
  emit: <E extends ServerEventName>(
    event: E,
    data: ServerEventInput<E>,
  ) => Promise<boolean>;
}

export function createRealtimeEmitter(
  config: RealtimeEmitterConfig,
): RealtimeEmitter {
  const { host, port, secretKey, timeout } = config;

  const client: TcpClient = createTcpClient({ host, port, secretKey, timeout });

  return {
    emit: async <E extends ServerEventName>(
      event: E,
      data: ServerEventInput<E>,
    ) => {
      return client.emit(event, data);
    },
  };
}
