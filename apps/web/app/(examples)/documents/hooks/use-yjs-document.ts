"use client";

import { useState, useEffect, useRef } from "react";
import * as Y from "yjs";
import { useSocket } from "@repo/realtime/client";

interface UseYjsDocumentReturn {
  doc: Y.Doc | null;
  isLoading: boolean;
  isSynced: boolean;
}

export function useYjsDocument(documentId: string): UseYjsDocumentReturn {
  const { socket, isConnected, emit, on } = useSocket();
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSynced, setIsSynced] = useState(false);
  const docRef = useRef<Y.Doc | null>(null);

  useEffect(() => {
    if (!isConnected || !socket) return;

    const yjsDoc = new Y.Doc();
    docRef.current = yjsDoc;
    setDoc(yjsDoc);
    setIsLoading(true);
    setIsSynced(false);

    emit("doc:join", { documentId });

    const applyEncodedUpdate = (encoded: string) => {
      const bytes = Buffer.from(encoded, "base64");
      Y.applyUpdate(yjsDoc, new Uint8Array(bytes));
    };

    const handleSync = (data: { documentId: string; state: string }) => {
      if (data.documentId !== documentId) return;

      applyEncodedUpdate(data.state);
      setIsLoading(false);
      setIsSynced(true);
    };

    const handleUpdate = (data: { documentId: string; update: string }) => {
      if (data.documentId !== documentId) return;

      applyEncodedUpdate(data.update);
    };

    const unsubSync = on("doc:sync", handleSync);
    const unsubUpdate = on("doc:update", handleUpdate);

    const sendUpdate = (update: Uint8Array) => {
      emit("doc:update", {
        documentId,
        update: Buffer.from(update).toString("base64"),
      });
    };

    yjsDoc.on("update", sendUpdate);

    return () => {
      emit("doc:leave", { documentId });
      yjsDoc.off("update", sendUpdate);
      unsubSync();
      unsubUpdate();
      yjsDoc.destroy();
      docRef.current = null;
    };
  }, [isConnected, socket, documentId, emit, on]);

  return { doc, isLoading, isSynced };
}
