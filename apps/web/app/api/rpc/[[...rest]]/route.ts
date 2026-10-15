import { RPCHandler } from "@orpc/server/fetch";
import { BatchHandlerPlugin } from "@orpc/server/plugins";
import { onError } from "@orpc/server";
import { headers } from "next/headers";
import { db } from "@repo/database";
import { appRouter } from "@repo/server";
import { getServerSession } from "@/lib/auth/get-server-session";

const handler = new RPCHandler(appRouter, {
  plugins: [new BatchHandlerPlugin()],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

async function handleRequest(request: Request) {
  const { response } = await handler.handle(request, {
    prefix: "/api/rpc",
    context: {
      headers: await headers(),
      db,
      session: await getServerSession(),
    },
  });

  return response ?? new Response("Not found", { status: 404 });
}

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
