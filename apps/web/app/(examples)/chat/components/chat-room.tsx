"use client";

import { ReactNode } from "react";
import type { User } from "../hooks/use-chat-room";
import { getUserColor } from "../../lib/user-color";
import type { RoomParticipantsProps } from "../../_hooks/room-participants-props";

interface ChatRoomProps extends RoomParticipantsProps<User> {
  children: ReactNode;
}

export function ChatRoom({
  users,
  currentUserId,
  currentUserName,
  children,
}: ChatRoomProps) {
  const currentUser: User = { id: currentUserId, name: currentUserName };
  const otherUsers = users.filter((u) => u.id !== currentUserId);
  const allUsers = [currentUser, ...otherUsers];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr,200px]">
      <div className="flex flex-col rounded-lg border border-neutral-800 bg-neutral-900">
        {children}
      </div>

      <aside className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
        <h3 className="mb-3 text-sm font-semibold text-white">
          In Room ({allUsers.length})
        </h3>
        <ul className="space-y-2">
          {allUsers.map((user) => (
            <li key={user.id} className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: getUserColor(user.id) }}
              />
              <span className="truncate text-sm text-neutral-300">
                {user.name}
                {user.id === currentUserId && (
                  <span className="ml-1 text-neutral-500">(you)</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
