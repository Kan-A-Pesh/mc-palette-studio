"use client";

import { useSocket } from "@repo/realtime/client";

type SocketUser = ReturnType<typeof useSocket>["user"];

interface CurrentSocketUser {
  user: SocketUser;
  isConnected: boolean;
  currentUserId: string;
  currentUserName: string;
}

/**
 * Resolves the current realtime socket user with display-ready fallbacks.
 * Shared by the chat and document example views so the id/name defaults live in
 * one place.
 */
export function useCurrentSocketUser(): CurrentSocketUser {
  const { user, isConnected } = useSocket();

  const currentUserId = user?.id ?? "loading";
  const currentUserName = user?.name ?? "Loading...";

  return { user, isConnected, currentUserId, currentUserName };
}
