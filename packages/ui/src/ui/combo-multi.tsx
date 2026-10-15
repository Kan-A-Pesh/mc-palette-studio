import * as PopoverPrimitives from "@radix-ui/react-popover";
import { RiArrowDownSLine, RiSearch2Line } from "@remixicon/react";
import { Command } from "cmdk";
import * as React from "react";

import * as Badge from "@/ui/badge";
import * as Checkbox from "@/ui/checkbox";
import { selectVariants } from "@/ui/select";
import { cn } from "@/utils/cn";

export type ComboMultiOption = {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  keywords?: string[];
  disabled?: boolean;
};

export type ComboMultiProps = {
  value?: string[];
  onValueChange?: (values: string[]) => void;
  options: ComboMultiOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  size?: "medium" | "small" | "xsmall";
  variant?: "default" | "compact" | "compactForInput" | "inline";
  hasError?: boolean;
  disabled?: boolean;
};

export function ComboMulti({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  className,
  size = "medium",
  variant = "default",
  hasError,
  disabled,
}: ComboMultiProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const selectedSet = React.useMemo(() => new Set(value ?? []), [value]);
  const selectedCount = selectedSet.size;

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return options;
    }
    return options.filter((opt) => {
      const text = (typeof opt.label === "string" ? opt.label : "")
        .toString()
        .toLowerCase();
      const keys = opt.keywords?.join(" ").toLowerCase() ?? "";
      return text.includes(q) || keys.includes(q);
    });
  }, [options, query]);

  const { triggerRoot, triggerArrow } = selectVariants({
    size,
    variant,
    hasError,
  });

  const toggleSelect = React.useCallback(
    (opt: ComboMultiOption) => {
      if (disabled || opt.disabled) {
        return;
      }
      const next = new Set(selectedSet);
      if (next.has(opt.value)) {
        next.delete(opt.value);
      } else {
        next.add(opt.value);
      }
      onValueChange?.(Array.from(next));
    },
    [disabled, onValueChange, selectedSet],
  );

  return (
    <PopoverPrimitives.Root modal onOpenChange={(v) => setOpen(v)} open={open}>
      <PopoverPrimitives.Trigger asChild>
        <button
          aria-expanded={open}
          aria-haspopup="listbox"
          className={triggerRoot({ class: cn(className) })}
          disabled={disabled}
          type="button"
        >
          <span className={cn("flex min-w-0 flex-1 items-center gap-2")}>
            <span className="line-clamp-1">
              {selectedCount > 0 ? (
                placeholder
              ) : (
                <span className="text-text-sub-600">{placeholder}</span>
              )}
            </span>
            {selectedCount > 0 ? (
              <Badge.Root color="gray" size="small" variant="light">
                {selectedCount}
              </Badge.Root>
            ) : null}
          </span>
          <RiArrowDownSLine className={triggerArrow()} />
        </button>
      </PopoverPrimitives.Trigger>

      <PopoverPrimitives.Portal>
        <PopoverPrimitives.Content
          className={cn(
            "relative z-50 overflow-hidden rounded-2xl bg-bg-white-0 shadow-regular-md ring-1 ring-stroke-soft-200 ring-inset",
            "min-w-[--radix-popper-anchor-width] max-w-[max(var(--radix-popper-anchor-width),320px)]",
            "data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:animate-in",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
          )}
          collisionPadding={10}
          onCloseAutoFocus={(e) => e.preventDefault()}
          sideOffset={8}
        >
          <Command
            filter={(val, search, keywords) => {
              const extend = `${val} ${keywords?.join(" ")}`;
              if (extend.toLowerCase().includes(search.toLowerCase())) {
                return 1;
              }
              return 0;
            }}
          >
            <div className="flex items-center gap-2 px-4 pt-2">
              <RiSearch2Line className="size-5 text-text-soft-400" />
              <Command.Input
                className="h-9 w-full bg-transparent text-paragraph-sm outline-none placeholder:text-text-soft-400"
                onValueChange={(v) => setQuery(v)}
                placeholder={searchPlaceholder}
                value={query}
              />
            </div>

            <Command.List className="max-h-[196px] overflow-auto p-2 pt-0">
              {filtered.map((opt) => {
                const isSelected = selectedSet.has(opt.value);
                return (
                  <Command.Item
                    className={cn(
                      "group cursor-pointer select-none rounded-lg p-2 text-paragraph-sm text-text-strong-950",
                      "flex items-center gap-2 data-[selected=true]:bg-bg-weak-50 data-[selected]:outline-0",
                    )}
                    disabled={opt.disabled}
                    key={opt.value}
                    keywords={opt.keywords}
                    // Do not close popover; toggle selection
                    onSelect={() => toggleSelect(opt)}
                    value={
                      typeof opt.label === "string"
                        ? opt.label
                        : String(opt.value)
                    }
                  >
                    <Checkbox.Root
                      checked={isSelected}
                      className="mr-1"
                      // Prevent double toggle: handle clicks locally
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(opt);
                      }}
                    />
                    {opt.icon ? (
                      <span className="size-5 shrink-0">{opt.icon}</span>
                    ) : null}
                    <span className="line-clamp-1">{opt.label}</span>
                  </Command.Item>
                );
              })}
            </Command.List>
          </Command>
        </PopoverPrimitives.Content>
      </PopoverPrimitives.Portal>
    </PopoverPrimitives.Root>
  );
}

export const Root = ComboMulti;
