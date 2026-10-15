"use client";

import { ExampleHeader } from "../../_components/example-header";
import { useCurrentSocketUser } from "../../_hooks/use-current-socket-user";
import { DEMO_DOCUMENT_ID, DEMO_ROOM_ID } from "../constants";
import { useDocumentRoom } from "../hooks/use-document-room";
import { CollaborativeEditor } from "./collaborative-editor";
import { CursorOverlay } from "./cursor-overlay";
import { UserList } from "./user-list";

export function DocumentsView() {
  const { isConnected, currentUserId, currentUserName } =
    useCurrentSocketUser();
  const { users, cursors, updateCursor } = useDocumentRoom(DEMO_ROOM_ID);

  return (
    <div className="min-h-screen bg-neutral-950 p-8">
      <div className="mx-auto max-w-4xl">
        <ExampleHeader
          title="Collaborative Document Editor"
          description="Real-time collaborative editing with Yjs. Open this page in multiple tabs and start typing - changes sync instantly!"
          currentUserName={currentUserName}
          isConnected={isConnected}
        />

        <div className="grid gap-6 lg:grid-cols-[1fr,250px]">
          <div className="relative">
            <div
              className="relative min-h-125 rounded-lg border border-neutral-800 bg-neutral-900"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                updateCursor(e.clientX - rect.left, e.clientY - rect.top);
              }}
            >
              <CollaborativeEditor documentId={DEMO_DOCUMENT_ID} />
              <CursorOverlay cursors={cursors} currentUserId={currentUserId} />
            </div>
          </div>

          <aside>
            <UserList
              users={users}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
