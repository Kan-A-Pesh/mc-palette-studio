"use client";

import { Check, Copy } from "lucide-react";
import type { WorldEditCommand } from "@repo/palette-core";

interface CommandRowProps {
  command: WorldEditCommand;
  step?: number;
  copied: boolean;
  onCopy: () => void;
}

export default function CommandRow({
  command,
  step,
  copied,
  onCopy,
}: CommandRowProps) {
  return (
    <li className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">
        {step ? `${step}. ` : ""}
        {command.label}
      </span>
      <div className="flex items-stretch overflow-hidden bg-studio-canvas ring-1 ring-studio-line">
        <code className="studio-scroll flex-1 overflow-x-auto whitespace-nowrap px-3 py-2.5 font-mono-studio text-st-md text-studio-text">
          {command.command}
        </code>
        <button
          type="button"
          onClick={onCopy}
          aria-label={`Copy: ${command.label}`}
          className="flex w-24 shrink-0 items-center justify-center gap-1.5 border-l border-studio-line text-xs font-medium text-studio-muted hover:bg-studio-raised hover:text-studio-text focus-visible:outline-2 focus-visible:outline-studio-accent"
        >
          {copied ? (
            <Check className="size-3.5 text-studio-accent" />
          ) : (
            <Copy className="size-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </li>
  );
}
