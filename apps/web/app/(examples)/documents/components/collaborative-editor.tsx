"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Collaboration from "@tiptap/extension-collaboration";
import { useYjsDocument } from "../hooks/use-yjs-document";

interface CollaborativeEditorProps {
  documentId: string;
}

export function CollaborativeEditor({ documentId }: CollaborativeEditorProps) {
  const { doc, isLoading, isSynced } = useYjsDocument(documentId);
  const [, setEditorReady] = useState(false);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          history: false,
        }),
        Placeholder.configure({
          placeholder: "Start typing to collaborate...",
        }),
        ...(doc
          ? [
              Collaboration.configure({
                document: doc,
                field: "prosemirror",
              }),
            ]
          : []),
      ],
      editorProps: {
        attributes: {
          class:
            "prose prose-invert prose-sm max-w-none p-6 focus:outline-none min-h-[400px]",
        },
      },
      onCreate: () => setEditorReady(true),
    },
    [doc],
  );

  if (isLoading || !doc) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-neutral-400 border-t-white mx-auto" />
          <p className="text-sm text-neutral-400">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {!isSynced && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-900/80">
          <p className="text-sm text-neutral-400">Syncing...</p>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
