"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "@repo/realtime/client";
import { useRoomMembership } from "../../_hooks/use-room-membership";

export interface Cursor {
  user: {
    id: string;
    name: string;
  };
  x: number;
  y: number;
}

export interface User {
  id: string;
  name: string;
  joinedAt: number;
}

export function useDocumentRoom(roomId: string) {
  const { emit, on, isConnected } = useSocket();
  const [users, setUsers] = useState<User[]>([]);
  const [cursors, setCursors] = useState<Map<string, Cursor>>(new Map());
  const throttleRef = useRef<number>(0);

  useRoomMembership(roomId);

  useEffect(() => {
    const unsubSync = on("room:sync", (payload) => {
      if (payload.roomId !== roomId) return;
      const newUserIds = new Set(payload.users.map((u) => u.id));
      setUsers((prev) => {
        const existingMap = new Map(prev.map((u) => [u.id, u]));
        return payload.users.map((user) => ({
          ...user,
          joinedAt: existingMap.get(user.id)?.joinedAt ?? Date.now(),
        }));
      });
      setCursors((prev) => {
        const next = new Map(prev);
        for (const userId of prev.keys()) {
          if (!newUserIds.has(userId)) {
            next.delete(userId);
          }
        }
        return next;
      });
    });

    const unsubCursor = on("cursor:update", (payload) => {
      if (payload.roomId !== roomId) return;
      setCursors((prev) => {
        const next = new Map(prev);
        next.set(payload.user.id, {
          user: payload.user,
          x: payload.x,
          y: payload.y,
        });
        return next;
      });
    });

    return () => {
      unsubSync();
      unsubCursor();
    };
  }, [on, roomId]);

  const updateCursor = useCallback(
    (x: number, y: number) => {
      const now = Date.now();
      if (now - throttleRef.current < 50) return;
      throttleRef.current = now;

      emit("cursor:move", { roomId, x, y });
    },
    [emit, roomId],
  );

  return {
    users,
    cursors,
    updateCursor,
    isConnected,
  };
}
