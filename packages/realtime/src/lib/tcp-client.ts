import { createConnection } from "net";
import { randomBytes } from "crypto";
import { createFrame, ACK_OK, type EmitMessage } from "./index";
import type { ConnectionConfig } from "./types";

export type TcpClientConfig = ConnectionConfig;

export function createTcpClient(config: TcpClientConfig) {
  const { host, port, secretKey, timeout = 5000 } = config;

  async function emit(event: string, data: unknown): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const socket = createConnection({ host, port }, () => {
        const message: EmitMessage = {
          event,
          data,
          timestamp: Date.now(),
          nonce: randomBytes(8).toString("hex"),
        };

        const frame = createFrame(message, secretKey);
        socket.write(frame);
      });

      socket.setTimeout(timeout);

      socket.once("data", (responseData) => {
        const ack = responseData[0];
        socket.destroy();
        resolve(ack === ACK_OK);
      });

      socket.once("timeout", () => {
        socket.destroy();
        reject(new Error("Realtime emit timeout"));
      });

      socket.once("error", (err) => {
        socket.destroy();
        reject(err);
      });
    });
  }

  return { emit };
}

export type TcpClient = ReturnType<typeof createTcpClient>;
