import * as Y from "yjs";
import { documentStates, SAVE_DEBOUNCE_MS } from "./state";
import { loadDocumentFromDb, saveDocumentToDb } from "./database";

function scheduleSave(documentId: string): void {
  const state = documentStates.get(documentId);
  if (!state) return;

  if (state.saveTimeout) {
    clearTimeout(state.saveTimeout);
  }

  state.saveTimeout = setTimeout(async () => {
    try {
      await saveDocumentToDb(documentId, state.doc);
      state.lastSaved = Date.now();
    } catch (err) {
      console.error(`[documents] Failed to save document ${documentId}:`, err);
    }
  }, SAVE_DEBOUNCE_MS);
}

export async function getOrCreateDocument(documentId: string): Promise<Y.Doc> {
  let state = documentStates.get(documentId);

  if (state) {
    return state.doc;
  }

  const doc = new Y.Doc();

  const savedState = await loadDocumentFromDb(documentId);
  if (savedState) {
    Y.applyUpdate(doc, savedState);
    console.log(`[documents] Loaded document ${documentId} from database`);
  } else {
    console.log(`[documents] Created new document ${documentId}`);
  }

  state = {
    doc,
    clients: new Set(),
    saveTimeout: null,
    lastSaved: Date.now(),
  };

  documentStates.set(documentId, state);

  return doc;
}

export function getDocumentState(documentId: string): Uint8Array | null {
  const state = documentStates.get(documentId);
  if (!state) return null;

  return Y.encodeStateAsUpdate(state.doc);
}

export function applyUpdate(documentId: string, update: Uint8Array): void {
  const state = documentStates.get(documentId);
  if (!state) return;

  Y.applyUpdate(state.doc, update);
  scheduleSave(documentId);
}

export function addClient(documentId: string, clientId: string): void {
  const state = documentStates.get(documentId);
  if (!state) return;

  state.clients.add(clientId);
}

export function removeClient(documentId: string, clientId: string): void {
  const state = documentStates.get(documentId);
  if (!state) return;

  state.clients.delete(clientId);

  if (state.clients.size === 0) {
    if (state.saveTimeout) {
      clearTimeout(state.saveTimeout);
    }
    saveDocumentToDb(documentId, state.doc)
      .then(() => {
        documentStates.delete(documentId);
        console.log(`[documents] Unloaded document ${documentId}`);
      })
      .catch((err) => {
        console.error(
          `[documents] Failed to save on unload ${documentId}:`,
          err,
        );
      });
  }
}

export async function saveAllDocuments(): Promise<void> {
  for (const [documentId, state] of documentStates) {
    if (state.saveTimeout) {
      clearTimeout(state.saveTimeout);
    }
    await saveDocumentToDb(documentId, state.doc);
  }
}
