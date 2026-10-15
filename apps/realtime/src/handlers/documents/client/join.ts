import { defineClientHandler } from "@repo/realtime/server";
import { joinDocRoom } from "@/lib/documents";

export const docJoinHandler = defineClientHandler<"doc:join">(
  async (ctx, data) => {
    const { clientId, state } = await joinDocRoom(ctx, data.documentId);

    ctx.socket.emit("doc:sync", {
      documentId: data.documentId,
      state: Buffer.from(state).toString("base64"),
    });

    console.log(
      `[documents] Client ${clientId} joined document ${data.documentId}`,
    );
  },
);
