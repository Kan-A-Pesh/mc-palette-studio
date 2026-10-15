import { defineClientHandler } from "@repo/realtime/server";
import { leaveDocRoom } from "@/lib/documents";

export const docLeaveHandler = defineClientHandler<"doc:leave">(
  async (ctx, data) => {
    const { clientId } = await leaveDocRoom(ctx, data.documentId);

    console.log(
      `[documents] Client ${clientId} left document ${data.documentId}`,
    );
  },
);
