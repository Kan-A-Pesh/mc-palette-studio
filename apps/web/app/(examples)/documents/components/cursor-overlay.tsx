"use client";

import type { Cursor } from "../hooks/use-document-room";
import { getUserColor } from "../../lib/user-color";

interface CursorOverlayProps {
  cursors: Map<string, Cursor>;
  currentUserId: string;
}

export function CursorOverlay({ cursors, currentUserId }: CursorOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from(cursors.values()).map((cursor) => {
        if (cursor.user.id === currentUserId) return null;

        const color = getUserColor(cursor.user.id);

        return (
          <div
            key={cursor.user.id}
            className="absolute transition-all duration-75 ease-out"
            style={{
              left: cursor.x,
              top: cursor.y,
              transform: "translate(-2px, -2px)",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              style={{ filter: `drop-shadow(0 2px 4px ${color}40)` }}
            >
              <path
                d="M5.65376 12.4563L12.9893 19.4563C13.3686 19.8206 14 19.548 14 19.0156V12.5156L20.4375 12.0312C20.9375 11.9687 21.1875 11.4062 20.9063 10.9999L11.4063 0.499943C10.8125 -0.156307 9.75 0.312568 9.75 1.09382V8.01564H3.25C2.75 8.01564 2.46875 8.54689 2.75 8.95314L5.65376 12.4563Z"
                fill={color}
              />
            </svg>
            <span
              className="ml-3 rounded-full px-2 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: color }}
            >
              {cursor.user.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
