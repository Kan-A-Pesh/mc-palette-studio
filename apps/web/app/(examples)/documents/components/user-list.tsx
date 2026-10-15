"use client";

import type { User } from "../hooks/use-document-room";
import { getUserColor } from "../../lib/user-color";
import type { RoomParticipantsProps } from "../../_hooks/room-participants-props";

type UserListProps = RoomParticipantsProps<User>;

export function UserList({
  users,
  currentUserId,
  currentUserName,
}: UserListProps) {
  const currentUser: User = {
    id: currentUserId,
    name: currentUserName,
    joinedAt: Date.now(),
  };
  const otherUsers = users.filter((u) => u.id !== currentUserId);
  const allUsers = [currentUser, ...otherUsers];

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <h3 className="mb-3 text-sm font-semibold text-white">
        Online ({allUsers.length})
      </h3>
      <ul className="space-y-2">
        {allUsers.map((user) => (
          <li key={user.id} className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: getUserColor(user.id) }}
            />
            <span className="text-sm text-neutral-300">
              {user.name}
              {user.id === currentUserId && (
                <span className="ml-1 text-neutral-500">(you)</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
