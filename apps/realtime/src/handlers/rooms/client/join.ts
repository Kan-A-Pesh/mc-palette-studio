import { defineClientHandler } from "@repo/realtime/server";
import { getClientInfo } from "@/lib/helpers";
import { addRoomUser } from "../utils";

export const roomJoinHandler = defineClientHandler<"room:join">(
  async (ctx, data) => {
    await ctx.socket.join(data.roomId);
    const clientInfo = getClientInfo(ctx);
    const users = addRoomUser(data.roomId, clientInfo);
    ctx.io.to(data.roomId).emit("room:sync", {
      roomId: data.roomId,
      users,
    });
  },
);
