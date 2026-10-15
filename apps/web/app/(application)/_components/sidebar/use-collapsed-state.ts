"use client";

import * as React from "react";
import { useHotkeys } from "react-hotkeys-hook";

export function useCollapsedState(): {
  collapsed: boolean;
  sidebarRef: React.RefObject<HTMLDivElement | null>;
} {
  const [collapsed, setCollapsed] = React.useState(false);
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const showTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useHotkeys(
    ["ctrl+b", "meta+b"],
    () => setCollapsed((prev) => !prev),
    { preventDefault: true },
    [collapsed],
  );

  React.useEffect(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    if (!sidebarRef.current) {
      return;
    }

    const elementsToHide = sidebarRef.current.querySelectorAll(
      "[data-hide-collapsed]",
    );

    const listeners: { el: Element; listener: EventListener }[] = [];

    for (const el of elementsToHide) {
      const hideListener = () => {
        el.classList.add("hidden");
        el.classList.remove("transition", "duration-300");
      };

      const showListener = () => {
        el.classList.remove("transition", "duration-300");
      };

      if (collapsed) {
        el.classList.add("opacity-0", "transition", "duration-300");
        el.addEventListener("transitionend", hideListener, {
          once: true,
        });
        listeners.push({ el, listener: hideListener });
      } else {
        el.classList.add("transition", "duration-300");
        el.classList.remove("hidden");
        showTimeoutRef.current = setTimeout(() => {
          el.classList.remove("opacity-0");
        }, 1);
        el.addEventListener("transitionend", showListener, {
          once: true,
        });
        listeners.push({ el, listener: showListener });
      }
    }

    return () => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
      for (const { el, listener } of listeners) {
        el.removeEventListener("transitionend", listener);
      }
    };
  }, [collapsed]);

  return { collapsed, sidebarRef };
}
