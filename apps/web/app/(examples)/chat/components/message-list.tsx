"use client";

import { cn } from "@repo/ui/utils/cn";
import { useEffect, useRef } from "react";
import type { Message } from "../hooks/use-chat-room";
import { getUserColor } from "../../lib/user-color";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-center text-neutral-500">
          No messages yet. Start chatting!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-3 overflow-y-auto p-4">
      {messages.map((message) => {
        const isOwn = message.user.id === currentUserId;
        const color = getUserColor(message.user.id);

        return (
          <div
            key={message.id}
            className={cn("flex", isOwn ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-4/5 rounded-lg px-3 py-2",
                isOwn
                  ? "bg-blue-600 text-white"
                  : "border border-neutral-700 bg-neutral-800 text-white",
              )}
            >
              {!isOwn && (
                <p className="mb-1 text-xs font-medium" style={{ color }}>
                  {message.user.name}
                </p>
              )}
              <p className="text-sm">{message.content}</p>
              <p
                className={cn(
                  "mt-1 text-xs",
                  isOwn ? "text-blue-200" : "text-neutral-500",
                )}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
