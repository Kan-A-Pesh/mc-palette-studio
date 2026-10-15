import type { RoomUser } from "@/types";

const roomUsers = new Map<string, Map<string, RoomUser>>();
const userRooms = new Map<string, Set<string>>();

function getOrCreate<K, V>(map: Map<K, V>, key: K, factory: () => V): V {
  let value = map.get(key);
  if (!value) {
    value = factory();
    map.set(key, value);
  }
  return value;
}

function getRoomUsersMap(roomId: string): Map<string, RoomUser> {
  return getOrCreate(roomUsers, roomId, () => new Map());
}

function getUserRoomsSet(userId: string): Set<string> {
  return getOrCreate(userRooms, userId, () => new Set());
}

export function addRoomUser(roomId: string, user: RoomUser): RoomUser[] {
  const users = getRoomUsersMap(roomId);
  users.set(user.id, user);

  const rooms = getUserRoomsSet(user.id);
  rooms.add(roomId);

  return Array.from(users.values());
}

export function removeRoomUser(roomId: string, userId: string): RoomUser[] {
  const users = getRoomUsersMap(roomId);
  users.delete(userId);
  if (users.size === 0) {
    roomUsers.delete(roomId);
  }

  const rooms = userRooms.get(userId);
  if (rooms) {
    rooms.delete(roomId);
    if (rooms.size === 0) {
      userRooms.delete(userId);
    }
  }

  return Array.from(users.values());
}

export function getUserJoinedRooms(userId: string): string[] {
  const rooms = userRooms.get(userId);
  return rooms ? Array.from(rooms) : [];
}

export function removeUserFromAllRooms(
  userId: string,
): Array<{ roomId: string; remainingUsers: RoomUser[] }> {
  const rooms = userRooms.get(userId);
  if (!rooms) return [];

  const updatedRooms: Array<{ roomId: string; remainingUsers: RoomUser[] }> =
    [];

  for (const roomId of rooms) {
    const users = roomUsers.get(roomId);
    if (users) {
      users.delete(userId);
      if (users.size === 0) {
        roomUsers.delete(roomId);
        updatedRooms.push({ roomId, remainingUsers: [] });
      } else {
        updatedRooms.push({
          roomId,
          remainingUsers: Array.from(users.values()),
        });
      }
    }
  }

  userRooms.delete(userId);

  return updatedRooms;
}
