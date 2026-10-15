import type { ClientHandlerContext } from "@repo/realtime";
import { getClientId } from "../helpers";
import {
  getOrCreateDocument,
  getDocumentState,
  addClient,
  removeClient,
} from "./operations";

function docRoomName(documentId: string): string {
  return `doc:${documentId}`;
}

/**
 * Adds the socket to a document room, registers the client, and returns the
 * client id plus the current encoded document state. Shared join-side logic for
 * the document handlers.
 */
export async function joinDocRoom(
  ctx: ClientHandlerContext,
  documentId: string,
): Promise<{ clientId: string; state: Uint8Array }> {
  const clientId = getClientId(ctx);

  await ctx.socket.join(docRoomName(documentId));
  await getOrCreateDocument(documentId);
  addClient(documentId, clientId);

  const state = getDocumentState(documentId);
  return { clientId, state: state! };
}

/**
 * Removes the socket from a document room and returns the client id. Shared
 * leave-side logic for the document handlers.
 */
export async function leaveDocRoom(
  ctx: ClientHandlerContext,
  documentId: string,
): Promise<{ clientId: string }> {
  const clientId = getClientId(ctx);

  await ctx.socket.leave(docRoomName(documentId));
  removeClient(documentId, clientId);

  return { clientId };
}
