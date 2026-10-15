import type {
  ClientEventName,
  ClientEventInput,
  ServerEventName,
  ServerEventInput,
} from "../events";
import type {
  ClientHandler,
  ServerHandler,
  ClientHandlerContext,
  ServerHandlerContext,
  AuthSession,
} from "./types";

export interface AuthenticatedClientHandlerContext
  extends Omit<ClientHandlerContext, "session"> {
  session: AuthSession;
}

export class AuthenticationRequiredError extends Error {
  constructor() {
    super("Authentication required");
    this.name = "AuthenticationRequiredError";
  }
}

export function requireAuth(
  ctx: ClientHandlerContext,
): asserts ctx is AuthenticatedClientHandlerContext {
  if (!ctx.session) {
    throw new AuthenticationRequiredError();
  }
}

export function defineClientHandler<E extends ClientEventName>(
  handler: (
    ctx: ClientHandlerContext,
    data: ClientEventInput<E>,
  ) => Promise<void> | void,
): ClientHandler<ClientEventInput<E>> {
  return handler;
}

export function defineAuthenticatedClientHandler<E extends ClientEventName>(
  handler: (
    ctx: AuthenticatedClientHandlerContext,
    data: ClientEventInput<E>,
  ) => Promise<void> | void,
): ClientHandler<ClientEventInput<E>> {
  return (ctx, data) => {
    requireAuth(ctx);
    return handler(ctx, data);
  };
}

export function defineServerHandler<E extends ServerEventName>(
  handler: (
    ctx: ServerHandlerContext,
    data: ServerEventInput<E>,
  ) => Promise<void> | void,
): ServerHandler<ServerEventInput<E>> {
  return handler;
}
