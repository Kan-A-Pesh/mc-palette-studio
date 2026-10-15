import { useEffect, useState } from "react";

import {
  type KeyboardShortcut,
  useKeyboardShortcuts,
} from "./use-keyboard-shortcuts";

export type IslandShortcut = {
  /**
   * The key or keys to listen for (e.g., "e", "esc", "del")
   */
  key: string;
  /**
   * The label for the button
   */
  label: string;
  /**
   * The action to execute when the shortcut is triggered
   */
  action: () => void;
  /**
   * Shortcut display text (if different from key)
   * e.g., "Esc" for "escape" key
   */
  displayKey?: string;
};

export type UseIslandShortcutsOptions = {
  /**
   * Only enable shortcuts when this condition is true
   * @default true
   */
  enabled?: boolean;
  /**
   * Ignore shortcuts when focused on inputs
   * @default true
   */
  ignoreInputs?: boolean;
  /**
   * Optional function to handle escape key
   */
  onEscapeKey?: () => void;
};

/**
 * Hook to manage keyboard shortcuts for Island components
 *
 * @example
 * ```tsx
 * const { shortcuts, islandButtons } = useIslandShortcuts([
 *   { key: "e", label: "Edit", action: handleEdit },
 *   { key: "escape", label: "Cancel", action: handleCancel, displayKey: "Esc" },
 *   { key: "delete", label: "Delete", action: handleDelete, displayKey: "Del" },
 * ]);
 *
 * return (
 *   <Island show={show} count={count}>
 *     <IslandContent>
 *       <IslandBadge />
 *       {islandButtons}
 *     </IslandContent>
 *   </Island>
 * );
 * ```
 */
export function useIslandShortcuts(
  shortcuts: IslandShortcut[],
  options: UseIslandShortcutsOptions = {},
) {
  const { enabled = true, ignoreInputs = true, onEscapeKey } = options;
  const [mounted, setMounted] = useState(false);

  const hiddenShortcuts: KeyboardShortcut[] = [];
  if (onEscapeKey) {
    hiddenShortcuts.push({
      key: "escape",
      action: onEscapeKey,
      preventDefault: true,
      stopPropagation: true,
    });
  }

  const keyboardShortcuts: KeyboardShortcut[] = shortcuts.map((shortcut) => ({
    key: shortcut.key,
    action: shortcut.action,
    preventDefault: true,
    stopPropagation: true,
  }));

  const { triggerShortcut } = useKeyboardShortcuts(keyboardShortcuts, {
    enabled: enabled && mounted,
    ignoreInputs,
  });

  useKeyboardShortcuts(hiddenShortcuts, {
    enabled: enabled && mounted,
    ignoreInputs,
  });

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const shortcutComponents = shortcuts.map((shortcut, index) => ({
    key: index,
    shortcut: shortcut.displayKey || shortcut.key,
    label: shortcut.label,
    onClick: shortcut.action,
  }));

  return {
    shortcuts: keyboardShortcuts,
    shortcutComponents,
    triggerShortcut,
    enabled: enabled && mounted,
  };
}
