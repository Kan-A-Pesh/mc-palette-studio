import type * as Y from "yjs";

export interface DocumentState {
  doc: Y.Doc;
  clients: Set<string>;
  saveTimeout: ReturnType<typeof setTimeout> | null;
  lastSaved: number;
}

export const documentStates = new Map<string, DocumentState>();

export const SAVE_DEBOUNCE_MS = 3000;
