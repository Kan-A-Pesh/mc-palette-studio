import {
  createServer as createHttpServer,
  type Server as HttpServer,
} from "http";
import { Server, type ServerOptions } from "socket.io";
import {
  createTcpServer,
  type ClientHandler,
  type ServerHandler,
  type AuthSession,
  type SocketContext,
} from "../lib";
import type { ClientEventName, ClientEventInput } from "../events";
import { clientEvents } from "../events";

export interface UserInfo {
  id: string;
  name: string;
}

export interface DisconnectContext extends SocketContext {
  userInfo: UserInfo;
}

export type DisconnectHandler = (
  ctx: DisconnectContext,
) => Promise<void> | void;

export interface RealtimeServerConfig {
  wsPort?: number;
  tcpPort?: number;
  secretKey: string;
  cors?: ServerOptions["cors"];
  authenticate: (
    socket: Parameters<Parameters<Server["on"]>[1]>[0],
  ) => Promise<AuthSession | null>;
  getUserInfo: (session: AuthSession | null, socketId: string) => UserInfo;
  onDisconnect?: DisconnectHandler;
  handlers: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client: Partial<Record<ClientEventName, ClientHandler<any>>>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    server: Record<string, ServerHandler<any>>;
  };
}

export interface RealtimeServer {
  io: Server;
  httpServer: HttpServer;
  start: () => void;
  stop: () => void;
}

export function createRealtimeServer(
  config: RealtimeServerConfig,
): RealtimeServer {
  const {
    wsPort = 3001,
    tcpPort = 9000,
    secretKey,
    cors,
    authenticate,
    getUserInfo,
    onDisconnect,
    handlers,
  } = config;

  const httpServer = createHttpServer();
  const io = new Server(httpServer, { cors });

  io.on("connection", async (socket) => {
    const session = await authenticate(socket);

    socket.data.session = session;
    socket.data.joinedAt = new Date().toISOString();

    if (session) {
      socket.join(`user:${session.user.id}`);
    }

    const userInfo = getUserInfo(session, socket.id);
    socket.data.userInfo = userInfo;

    socket.emit("connection:info", { user: userInfo });

    const socketId = userInfo.id;

    for (const [eventName, handler] of Object.entries(handlers.client)) {
      if (!handler) continue;

      const typedEventName = eventName as ClientEventName;
      const eventDef = clientEvents[typedEventName];

      socket.on(eventName, async (data: unknown) => {
        try {
          const parsed = eventDef.input.parse(data);

          await handler(
            {
              socket,
              session,
              io,
            },
            parsed,
          );
        } catch (err) {
          console.error(`[realtime] Handler error for ${eventName}:`, err);
        }
      });
    }

    socket.on("disconnect", async () => {
      console.log(`[realtime] Disconnected: ${socketId}`);

      if (onDisconnect) {
        try {
          await onDisconnect({
            socket,
            session,
            io,
            userInfo,
          });
        } catch (err) {
          console.error(`[realtime] Disconnect handler error:`, err);
        }
      }
    });

    console.log(`[realtime] Connected: ${socketId}`);
  });

  const tcpServer = createTcpServer({
    port: tcpPort,
    secretKey,
    io,
    handlers: handlers.server,
  });

  return {
    io,
    httpServer,
    start: () => {
      httpServer.listen(wsPort, () => {
        console.log(`[realtime] WebSocket server listening on port ${wsPort}`);
      });
    },
    stop: () => {
      io.close();
      httpServer.close();
      tcpServer.close();
    },
  };
}
