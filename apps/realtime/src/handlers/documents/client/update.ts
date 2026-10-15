import { defineClientHandler } from "@repo/realtime/server";
import { applyUpdate } from "@/lib/documents";

export const docUpdateHandler = defineClientHandler<"doc:update">(
  async (ctx, data) => {
    const updateBuffer = Buffer.from(data.update, "base64");
    applyUpdate(data.documentId, updateBuffer);

    const roomName = `doc:${data.documentId}`;
    ctx.socket.to(roomName).emit("doc:update", {
      documentId: data.documentId,
      update: data.update,
    });
  },
);
