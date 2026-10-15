import type { Server, Socket } from "socket.io";
import type { z } from "zod";

// Shared base for any TCP connection target (broker emitter, raw client, …).
// Concrete configs extend this so they can diverge later while sharing the
// connection envelope today.
export interface ConnectionConfig {
  host: string;
  port: number;
  secretKey: string;
  timeout?: number;
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

// Shared base for any per-socket handler context (incoming events,
// disconnect, …). Concrete contexts extend this to add their own fields.
export interface SocketContext {
  socket: Socket;
  session: AuthSession | null;
  io: Server;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- distinct named context sharing the socket base; fields may diverge later
export interface ClientHandlerContext extends SocketContext {}

export interface ServerHandlerContext {
  io: Server;
}

export interface EmitMessage {
  event: string;
  data: unknown;
  timestamp: number;
  nonce: string;
}

export type EventDefinition<T extends z.ZodType = z.ZodType> = {
  input: T;
};

export type PayloadDefinition<T extends z.ZodType = z.ZodType> = {
  payload: T;
};

export type ClientHandler<TInput = unknown> = (
  ctx: ClientHandlerContext,
  data: TInput,
) => Promise<void> | void;

export type ServerHandler<TInput = unknown> = (
  ctx: ServerHandlerContext,
  data: TInput,
) => Promise<void> | void;

export const ACK_OK = 0x01;
export const ACK_ERR = 0x00;
