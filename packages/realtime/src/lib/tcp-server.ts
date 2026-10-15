import {
  createServer,
  type Socket as NetSocket,
  type Server as NetServer,
} from "net";
import type { Server as SocketIOServer } from "socket.io";
import { parseFrame, ACK_OK, ACK_ERR, type ServerHandler } from "./index";

export interface TcpServerConfig {
  port: number;
  secretKey: string;
  io: SocketIOServer;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handlers: Record<string, ServerHandler<any>>;
}

const NONCE_EXPIRY_MS = 60_000;
const seenNonces = new Map<string, number>();

function cleanupNonces() {
  const now = Date.now();
  for (const [nonce, timestamp] of seenNonces) {
    if (now - timestamp > NONCE_EXPIRY_MS) {
      seenNonces.delete(nonce);
    }
  }
}

setInterval(cleanupNonces, 30_000);

function isValidTimestamp(timestamp: number): boolean {
  const now = Date.now();
  return Math.abs(now - timestamp) <= NONCE_EXPIRY_MS;
}

function isReplayAttack(nonce: string, timestamp: number): boolean {
  if (seenNonces.has(nonce)) {
    return true;
  }
  seenNonces.set(nonce, timestamp);
  return false;
}

export function createTcpServer(config: TcpServerConfig): NetServer {
  const { port, secretKey, io, handlers } = config;

  const server = createServer((socket: NetSocket) => {
    let buffer: Buffer = Buffer.alloc(0);

    socket.on("data", async (chunk: Buffer) => {
      buffer = Buffer.concat([buffer, chunk]);

      try {
        const result = parseFrame(buffer, secretKey);

        if (result) {
          const { message, remaining } = result;
          buffer = Buffer.from(remaining);

          if (!isValidTimestamp(message.timestamp)) {
            console.warn("[realtime-tcp] Message timestamp invalid");
            socket.write(Buffer.from([ACK_ERR]));
            socket.end();
            return;
          }

          if (isReplayAttack(message.nonce, message.timestamp)) {
            console.warn("[realtime-tcp] Replay attack detected");
            socket.write(Buffer.from([ACK_ERR]));
            socket.end();
            return;
          }

          const handler = handlers[message.event];

          if (handler) {
            try {
              await handler({ io }, message.data);
              socket.write(Buffer.from([ACK_OK]));
            } catch (err) {
              console.error("[realtime-tcp] Handler error:", err);
              socket.write(Buffer.from([ACK_ERR]));
            }
          } else {
            console.warn(
              `[realtime-tcp] No handler for event: ${message.event}`,
            );
            socket.write(Buffer.from([ACK_ERR]));
          }

          socket.end();
        }
      } catch (err) {
        console.error("[realtime-tcp] Frame error:", err);
        socket.write(Buffer.from([ACK_ERR]));
        socket.end();
      }
    });

    socket.on("error", () => socket.destroy());
    socket.setTimeout(10000, () => socket.destroy());
  });

  server.listen(port, () => {
    console.log(`[realtime-tcp] Internal server listening on port ${port}`);
  });

  return server;
}
