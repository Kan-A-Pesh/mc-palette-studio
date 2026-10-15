import { env, authenticate, generateAnonymousName } from "./lib";
import { saveAllDocuments } from "./lib/documents";
import {
  createRealtimeServer,
  type UserInfo,
  type DisconnectContext,
  type RealtimeServer,
} from "@repo/realtime/server";
import {
  initializeAnalyticsServer,
  shutdownAnalytics,
} from "@repo/analytics/server";
import { realtimeHandlers } from "./handlers/register-handlers";
import type { AuthSession } from "@repo/realtime";
import { removeUserFromAllRooms } from "./handlers/rooms/utils";

if (env.NEXT_PUBLIC_POSTHOG_KEY) {
  initializeAnalyticsServer({
    apiKey: env.NEXT_PUBLIC_POSTHOG_KEY,
    host: env.NEXT_PUBLIC_POSTHOG_HOST,
  });
}

function getUserInfo(session: AuthSession | null, socketId: string): UserInfo {
  if (session?.user) {
    return {
      id: session.user.id,
      name: session.user.name ?? generateAnonymousName(socketId),
    };
  }

  return {
    id: `anon-${socketId.slice(0, 8)}`,
    name: generateAnonymousName(socketId),
  };
}

function handleDisconnect(ctx: DisconnectContext): void {
  const updatedRooms = removeUserFromAllRooms(ctx.userInfo.id);

  for (const { roomId, remainingUsers } of updatedRooms) {
    ctx.io.to(roomId).emit("room:sync", {
      roomId,
      users: remainingUsers,
    });
  }
}

export function createApp(): RealtimeServer {
  const server = createRealtimeServer({
    wsPort: env.WS_PORT,
    tcpPort: env.TCP_PORT,
    secretKey: env.REALTIME_SECRET_KEY,
    cors: {
      origin: (origin, callback) => {
        const allowedPatterns = [/\.vercel\.app$/, /localhost:\d+$/];

        if (env.ALLOWED_ORIGINS) {
          const customOrigins = env.ALLOWED_ORIGINS.split(",");
          for (const customOrigin of customOrigins) {
            if (origin === customOrigin.trim()) {
              callback(null, true);
              return;
            }
          }
        }

        const allowed = !origin || allowedPatterns.some((p) => p.test(origin));
        callback(null, allowed);
      },
      credentials: true,
    },
    authenticate,
    getUserInfo,
    onDisconnect: handleDisconnect,
    handlers: {
      client: realtimeHandlers.client,
      server: realtimeHandlers.server,
    },
  });

  return server;
}

export async function shutdown(server: RealtimeServer | null): Promise<void> {
  console.log("[realtime] Shutting down...");
  console.log("[realtime] Saving all documents...");
  await saveAllDocuments();
  await shutdownAnalytics();
  server?.stop();
  process.exit(0);
}
