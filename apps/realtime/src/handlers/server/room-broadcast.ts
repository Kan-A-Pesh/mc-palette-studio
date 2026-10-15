import { defineServerHandler } from "@repo/realtime/server";

/**
 * Event names reserved by socket.io. Emitting any of these would interfere with
 * the connection lifecycle (or trigger EventEmitter side effects), so they are
 * rejected before reaching `emit`.
 */
const RESERVED_EVENT_NAMES = new Set([
  "connect",
  "connect_error",
  "disconnect",
  "disconnecting",
  "newListener",
  "removeListener",
]);

export const roomBroadcastHandler = defineServerHandler<"room:broadcast">(
  async (ctx, data) => {
    if (RESERVED_EVENT_NAMES.has(data.event)) {
      throw new Error(
        `[room:broadcast] Refused to emit reserved event name "${data.event}"`,
      );
    }

    ctx.io.to(data.roomId).emit(data.event, data.data);
  },
);
