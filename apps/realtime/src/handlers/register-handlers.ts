import {
  roomJoinHandler,
  roomLeaveHandler,
  messageSendHandler,
  cursorMoveHandler,
} from "./rooms";
import {
  docJoinHandler,
  docLeaveHandler,
  docUpdateHandler,
  docAwarenessHandler,
} from "./documents";
import { notificationSendHandler, roomBroadcastHandler } from "./server";

export const realtimeHandlers = {
  client: {
    "room:join": roomJoinHandler,
    "room:leave": roomLeaveHandler,
    "message:send": messageSendHandler,
    "cursor:move": cursorMoveHandler,
    "doc:join": docJoinHandler,
    "doc:leave": docLeaveHandler,
    "doc:update": docUpdateHandler,
    "doc:awareness": docAwarenessHandler,
  },
  server: {
    "notification:send": notificationSendHandler,
    "room:broadcast": roomBroadcastHandler,
  },
};
