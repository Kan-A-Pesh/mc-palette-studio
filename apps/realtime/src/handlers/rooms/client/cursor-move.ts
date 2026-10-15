import { defineClientHandler } from "@repo/realtime/server";
import { getClientInfo } from "@/lib/helpers";

export const cursorMoveHandler = defineClientHandler<"cursor:move">(
  async (ctx, data) => {
    const clientInfo = getClientInfo(ctx);
    ctx.socket.to(data.roomId).emit("cursor:update", {
      roomId: data.roomId,
      user: clientInfo,
      x: data.x,
      y: data.y,
    });
  },
);
