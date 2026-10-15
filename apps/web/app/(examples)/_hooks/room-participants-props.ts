/**
 * Shared props for components that render the participants of a realtime room
 * (the chat sidebar and the document user list). Generic over the room's user
 * shape so each feature keeps its own User type.
 */
export interface RoomParticipantsProps<TUser> {
  users: TUser[];
  currentUserId: string;
  currentUserName: string;
}
