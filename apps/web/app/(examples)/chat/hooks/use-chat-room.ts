"use client";

import { useState, useEffect, useCallback } from "react";
import { useSocket } from "@repo/realtime/client";
import { useRoomMembership } from "../../_hooks/use-room-membership";

export interface Message {
  id: string;
  roomId: string;
  user: {
    id: string;
    name: string;
  };
  content: string;
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
}

export function useChatRoom(roomId: string) {
  const { emit, on, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useRoomMembership(roomId);

  useEffect(() => {
    const unsubMessage = on("message:new", (payload) => {
      if (payload.roomId !== roomId) return;
      setMessages((prev) => [
        ...prev,
        {
          id: `${payload.user.id}-${payload.timestamp}`,
          roomId: payload.roomId,
          user: payload.user,
          content: payload.content,
          timestamp: payload.timestamp,
        },
      ]);
    });

    const unsubSync = on("room:sync", (payload) => {
      if (payload.roomId !== roomId) return;
      setUsers(payload.users);
    });

    return () => {
      unsubMessage();
      unsubSync();
    };
  }, [on, roomId]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim()) return;
      emit("message:send", { roomId, content: content.trim() });
    },
    [emit, roomId],
  );

  return {
    messages,
    users,
    sendMessage,
    isConnected,
  };
}
