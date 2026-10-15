"use client";

import { useRealtime, type RealtimeContextValue } from "./provider";

type UseSocketReturn = Pick<
  RealtimeContextValue,
  "socket" | "isConnected" | "user" | "emit" | "on"
>;

export function useSocket(): UseSocketReturn {
  const { socket, isConnected, user, emit, on } = useRealtime();

  return {
    socket,
    isConnected,
    user,
    emit,
    on,
  };
}
