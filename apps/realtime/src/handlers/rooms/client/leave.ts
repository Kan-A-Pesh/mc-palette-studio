import { defineClientHandler } from "@repo/realtime/server";
import { getClientInfo } from "@/lib/helpers";
import { removeRoomUser } from "../utils";

export const roomLeaveHandler = defineClientHandler<"room:leave">(
  async (ctx, data) => {
    const clientInfo = getClientInfo(ctx);
    const users = removeRoomUser(data.roomId, clientInfo.id);
    await ctx.socket.leave(data.roomId);
    ctx.io.to(data.roomId).emit("room:sync", {
      roomId: data.roomId,
      users,
    });
  },
);
