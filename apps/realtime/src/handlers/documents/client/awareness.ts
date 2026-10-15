import { defineClientHandler } from "@repo/realtime/server";

export const docAwarenessHandler = defineClientHandler<"doc:awareness">(
  async (ctx, data) => {
    const roomName = `doc:${data.documentId}`;
    ctx.socket.to(roomName).emit("doc:awareness", {
      documentId: data.documentId,
      awareness: data.awareness,
    });
  },
);
