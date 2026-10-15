"use client";

import { useEffect } from "react";
import { useSocket } from "@repo/realtime/client";

/**
 * Joins a realtime room on connect and leaves it on cleanup. Shared by the chat
 * and document example rooms so the join/leave lifecycle lives in one place.
 */
export function useRoomMembership(roomId: string) {
  const { emit, isConnected } = useSocket();

  useEffect(() => {
    if (!isConnected) return;

    emit("room:join", { roomId });

    return () => {
      emit("room:leave", { roomId });
    };
  }, [isConnected, roomId, emit]);
}
