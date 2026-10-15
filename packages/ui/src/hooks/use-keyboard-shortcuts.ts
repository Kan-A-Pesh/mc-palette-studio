import { useCallback, useEffect, useRef } from "react";

export type KeyboardShortcut = {
  /**
   * The key or keys to listen for
   * Can be a single key (e.g., "e") or key combination (e.g., "ctrl+s")
   */
  key: string;
  /**
   * The action to execute when the shortcut is triggered
   */
  action: () => void;
  /**
   * Whether to prevent the default browser action
   * @default true
   */
  preventDefault?: boolean;
  /**
   * Whether to stop event propagation
   * @default false
   */
  stopPropagation?: boolean;
};

export type KeyboardShortcutsOptions = {
  /**
   * Enable or disable all shortcuts
   * @default true
   */
  enabled?: boolean;
  /**
   * Whether shortcuts should only trigger when an input element is not focused
   * @default true
   */
  ignoreInputs?: boolean;
  /**
   * Optional element to attach the event listener to
   * @default window
   */
  target?: typeof window | HTMLElement | null;
};

type ModifierKeys = {
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
};

type ParsedShortcut = {
  key: string;
  modifiers: {
    ctrl: boolean;
    alt: boolean;
    shift: boolean;
    meta: boolean;
  };
};

function parseShortcut(shortcutKey: string): ParsedShortcut {
  const parts = shortcutKey
    .toLowerCase()
    .split("+")
    .map((p) => p.trim());

  return {
    key:
      parts.filter(
        (p) => !["ctrl", "alt", "shift", "meta", "cmd"].includes(p),
      )[0] || "",
    modifiers: {
      ctrl: parts.includes("ctrl"),
      alt: parts.includes("alt"),
      shift: parts.includes("shift"),
      meta: parts.includes("meta") || parts.includes("cmd"),
    },
  };
}

function modifiersMatch(
  required: ParsedShortcut["modifiers"],
  actual: ModifierKeys,
): boolean {
  return (
    required.ctrl === actual.ctrlKey &&
    required.alt === actual.altKey &&
    required.shift === actual.shiftKey &&
    required.meta === actual.metaKey
  );
}

function normalizeKey(key: string): string {
  return key.toLowerCase() === "esc" ? "escape" : key.toLowerCase();
}

function shortcutMatches(
  shortcut: KeyboardShortcut,
  event: KeyboardEvent,
): boolean {
  const eventKey = normalizeKey(event.key);
  const shortcutKey = shortcut.key.toLowerCase();

  if (shortcutKey.includes("+")) {
    const parsed = parseShortcut(shortcutKey);
    return (
      normalizeKey(parsed.key) === eventKey &&
      modifiersMatch(parsed.modifiers, {
        ctrlKey: event.ctrlKey,
        altKey: event.altKey,
        shiftKey: event.shiftKey,
        metaKey: event.metaKey,
      })
    );
  }

  return normalizeKey(shortcutKey) === eventKey;
}

function isInputElement(target: EventTarget | null): boolean {
  if (!(target && target instanceof HTMLElement)) {
    return false;
  }

  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target.isContentEditable
  );
}

function executeShortcut(
  shortcut: KeyboardShortcut,
  event: KeyboardEvent,
): void {
  if (shortcut.preventDefault !== false) {
    event.preventDefault();
  }
  if (shortcut.stopPropagation) {
    event.stopPropagation();
  }
  shortcut.action();
}

/**
 * Hook to handle keyboard shortcuts
 *
 * @example
 * ```tsx
 * const shortcuts = useKeyboardShortcuts([
 *   { key: "e", action: () => handleEdit() },
 *   { key: "escape", action: handleCancel },
 *   { key: "ctrl+s", action: handleSave },
 * ]);
 * ```
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: KeyboardShortcutsOptions = {},
) {
  const {
    enabled = true,
    ignoreInputs = true,
    target = typeof window !== "undefined" ? window : null,
  } = options;

  const shortcutsRef = useRef(shortcuts);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) {
        return;
      }

      if (ignoreInputs && isInputElement(event.target)) {
        return;
      }

      for (const shortcut of shortcutsRef.current) {
        if (shortcutMatches(shortcut, event)) {
          executeShortcut(shortcut, event);
          return;
        }
      }
    },
    [enabled, ignoreInputs],
  );

  useEffect(() => {
    if (!target) {
      return;
    }
    target.addEventListener("keydown", handleKeyDown as EventListener);
    return () => {
      target.removeEventListener("keydown", handleKeyDown as EventListener);
    };
  }, [target, handleKeyDown]);

  return {
    enabled,
    triggerShortcut: (key: string) => {
      const shortcut = shortcuts.find(
        (s) => s.key.toLowerCase() === key.toLowerCase(),
      );
      if (shortcut) {
        shortcut.action();
        return true;
      }
      return false;
    },
  };
}
