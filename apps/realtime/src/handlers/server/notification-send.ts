import { defineServerHandler } from "@repo/realtime/server";

export const notificationSendHandler = defineServerHandler<"notification:send">(
  async (ctx, data) => {
    ctx.io.to(`user:${data.userId}`).emit("notification:new", {
      title: data.title,
      message: data.message,
    });
  },
);
