"use client";

import { useEffect, useCallback } from "react";
import { useRealtime, type RealtimeContextValue } from "./provider";

export interface UseRoomOptions {
  autoJoin?: boolean;
}

export interface UseRoomReturn
  extends Pick<RealtimeContextValue, "socket" | "isConnected" | "emit" | "on"> {
  roomId: string;
  join: () => void;
  leave: () => void;
}

export function useRoom(
  roomId: string,
  options: UseRoomOptions = {},
): UseRoomReturn {
  const { socket, emit, on, isConnected } = useRealtime();
  const { autoJoin = true } = options;

  useEffect(() => {
    if (!isConnected || !autoJoin) return;

    emit("room:join", { roomId });

    return () => {
      emit("room:leave", { roomId });
    };
  }, [roomId, isConnected, autoJoin, emit]);

  const join = useCallback(() => {
    emit("room:join", { roomId });
  }, [roomId, emit]);

  const leave = useCallback(() => {
    emit("room:leave", { roomId });
  }, [roomId, emit]);

  return {
    socket,
    isConnected,
    roomId,
    join,
    leave,
    emit,
    on,
  };
}
