import type { ClientHandlerContext } from "@repo/realtime";
import { generateAnonymousName } from "./name-generator";

export function getClientInfo(ctx: ClientHandlerContext): {
  id: string;
  name: string;
} {
  if (ctx.session?.user) {
    return {
      id: ctx.session.user.id,
      name: ctx.session.user.name ?? generateAnonymousName(ctx.socket.id),
    };
  }

  const anonymousId = `anon-${ctx.socket.id.slice(0, 8)}`;
  return {
    id: anonymousId,
    name: generateAnonymousName(ctx.socket.id),
  };
}

export function getClientId(ctx: ClientHandlerContext): string {
  return ctx.session?.user.id ?? `anon-${ctx.socket.id.slice(0, 8)}`;
}
