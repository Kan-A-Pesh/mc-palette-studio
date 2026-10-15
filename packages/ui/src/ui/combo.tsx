import * as PopoverPrimitives from "@radix-ui/react-popover";
import { RiArrowDownSLine, RiCheckLine, RiSearch2Line } from "@remixicon/react";
import { Command } from "cmdk";
import * as React from "react";
import { selectVariants } from "@/ui/select";
import { cn } from "@/utils/cn";

export type ComboOption = {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  keywords?: string[];
  disabled?: boolean;
};

export type ComboProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  options: ComboOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  size?: "medium" | "small" | "xsmall";
  variant?: "default" | "compact" | "compactForInput" | "inline";
  hasError?: boolean;
  disabled?: boolean;
};

export function Combo({
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
}: ComboProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const selected = React.useMemo(() => {
    return options.find((o) => o.value === value);
  }, [options, value]);

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

  const { triggerRoot, triggerIcon, triggerArrow } = selectVariants({
    size,
    variant,
    hasError,
  });

  const handleSelect = React.useCallback(
    (opt: ComboOption) => {
      if (disabled || opt.disabled) {
        return;
      }
      onValueChange?.(opt.value);
      setOpen(false);
      setQuery("");
    },
    [disabled, onValueChange],
  );

  return (
    <PopoverPrimitives.Root
      modal
      onOpenChange={(v) => {
        setOpen(v);
      }}
      open={open}
    >
      <PopoverPrimitives.Trigger asChild>
        <button
          aria-expanded={open}
          aria-haspopup="listbox"
          className={triggerRoot({ class: cn(className) })}
          disabled={disabled}
          type="button"
        >
          {selected ? (
            <span className={cn("flex min-w-0 flex-1 items-center gap-2")}>
              {selected.icon ? (
                <span className={triggerIcon()}>{selected.icon}</span>
              ) : null}
              <span className="line-clamp-1">{selected.label}</span>
            </span>
          ) : (
            <span className={cn("flex-1 text-text-sub-600")}>
              {placeholder}
            </span>
          )}
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
          onCloseAutoFocus={(e) => {
            e.preventDefault();
          }}
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
                onValueChange={(v) => {
                  setQuery(v);
                }}
                placeholder={searchPlaceholder}
                value={query}
              />
            </div>

            <Command.List className="max-h-[196px] overflow-auto p-2 pt-0">
              {filtered.map((opt) => {
                return (
                  <Command.Item
                    className={cn(
                      "group relative cursor-pointer select-none rounded-lg p-2 pr-9 text-paragraph-sm text-text-strong-950",
                      "flex items-center gap-2 data-[selected=true]:bg-bg-weak-50 data-[selected]:outline-0",
                    )}
                    disabled={opt.disabled}
                    key={opt.value}
                    keywords={opt.keywords}
                    onSelect={() => {
                      handleSelect(opt);
                    }}
                    value={
                      typeof opt.label === "string"
                        ? opt.label
                        : String(opt.value)
                    }
                  >
                    {opt.icon ? (
                      <span className="size-5 shrink-0">{opt.icon}</span>
                    ) : null}
                    <span className="line-clamp-1">{opt.label}</span>
                    {value === opt.value ? (
                      <RiCheckLine className="-translate-y-1/2 absolute top-1/2 right-2 size-5 shrink-0 text-text-sub-600" />
                    ) : null}
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

export const Root = Combo;
