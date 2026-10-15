"use client";

import { ExampleHeader } from "../../_components/example-header";
import { useCurrentSocketUser } from "../../_hooks/use-current-socket-user";
import { DEMO_ROOM_ID } from "../constants";
import { useChatRoom } from "../hooks/use-chat-room";
import { ChatRoom } from "./chat-room";
import { MessageInput } from "./message-input";
import { MessageList } from "./message-list";

export function ChatView() {
  const { isConnected, currentUserId, currentUserName } =
    useCurrentSocketUser();
  const { messages, users, sendMessage } = useChatRoom(DEMO_ROOM_ID);

  return (
    <div className="min-h-screen bg-neutral-950 p-8">
      <div className="mx-auto max-w-2xl">
        <ExampleHeader
          title="Real-time Chat"
          description="Simple chat room example. Open in multiple tabs to chat with yourself!"
          currentUserName={currentUserName}
          isConnected={isConnected}
        />

        <ChatRoom
          users={users}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
        >
          <MessageList messages={messages} currentUserId={currentUserId} />
          <MessageInput onSend={sendMessage} disabled={!isConnected} />
        </ChatRoom>
      </div>
    </div>
  );
}
