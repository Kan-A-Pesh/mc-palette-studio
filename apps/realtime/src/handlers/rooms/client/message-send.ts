import { defineClientHandler } from "@repo/realtime/server";
import { getClientInfo } from "@/lib/helpers";

export const messageSendHandler = defineClientHandler<"message:send">(
  async (ctx, data) => {
    const clientInfo = getClientInfo(ctx);
    ctx.io.to(data.roomId).emit("message:new", {
      roomId: data.roomId,
      user: clientInfo,
      content: data.content,
      timestamp: Date.now(),
    });
  },
);
