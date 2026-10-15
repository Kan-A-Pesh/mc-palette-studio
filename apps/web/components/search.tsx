"use client";

import {
  RiArrowDownLine,
  RiArrowUpLine,
  RiCloseLine,
  RiCornerDownLeftLine,
  RiSearch2Line,
  RiLoader4Line,
} from "@repo/ui/icon";
import * as React from "react";

import * as TopbarItemButton from "@repo/ui/topbar-item-button";
import * as CommandMenu from "@repo/ui/command-menu";
import * as CompactButton from "@repo/ui/compact-button";
import { CmdIcon } from "@repo/ui/icons";
import * as Kbd from "@repo/ui/kbd";
import * as LinkButton from "@repo/ui/link-button";
import { useSearchStore } from "@/lib/stores/search-store";
import { useSearchResults, type SearchItem } from "@/hooks/use-search-results";
import { cn } from "@repo/ui/utils/cn";
import Link from "next/link";
import { PROJECT } from "@repo/env/constants";

const VISIBLE_ITEMS_COUNT = 3;

export function SearchMenuButton({
  ...rest
}: React.ComponentPropsWithoutRef<typeof TopbarItemButton.Root>) {
  const setOpen = useSearchStore((state) => state.setOpen);

  return (
    <TopbarItemButton.Root onClick={() => setOpen(true)} {...rest}>
      <TopbarItemButton.Icon as={RiSearch2Line} />
    </TopbarItemButton.Root>
  );
}

function SearchResultItem({
  item,
  onSelect,
}: {
  item: SearchItem;
  onSelect: () => void;
}) {
  const itemRef = React.useRef<HTMLDivElement>(null);

  return (
    <CommandMenu.Item
      ref={itemRef}
      value={item.id}
      onSelect={onSelect}
      className="scroll-mt-1"
    >
      {item.icon && <CommandMenu.ItemIcon as={item.icon} />}
      <div className="flex flex-col gap-0.5">
        <span>{item.label}</span>
        {item.description && (
          <span className="text-paragraph-xs text-text-sub-600">
            {item.description}
          </span>
        )}
      </div>
    </CommandMenu.Item>
  );
}

export function SearchMenu() {
  const { isOpen: open, setOpen, toggle } = useSearchStore();
  const { query, setQuery, results, isSearching } = useSearchResults();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  React.useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open, setQuery]);

  const handleValueChange = React.useCallback(
    (value: string) => {
      setQuery(value);
    },
    [setQuery],
  );

  const hasResults = results.length > 0;

  const itemHeight = 52;
  const maxGroupHeight = VISIBLE_ITEMS_COUNT * itemHeight;

  return (
    <CommandMenu.Dialog onOpenChange={setOpen} open={open} shouldFilter={false}>
      <CommandMenu.DialogTitle className="sr-only">
        Search Menu
      </CommandMenu.DialogTitle>
      <CommandMenu.DialogDescription className="sr-only">
        This command menu allows you to quickly access features and navigate
        through different sections by typing relevant commands.
      </CommandMenu.DialogDescription>

      <div className="group/cmd-input flex h-12 w-full items-center gap-2 bg-bg-white-0 px-5">
        {isSearching ? (
          <RiLoader4Line className="size-5 shrink-0 text-primary-base animate-spin" />
        ) : (
          <RiSearch2Line
            className={cn(
              "size-5 shrink-0 text-text-soft-400",
              "transition duration-200 ease-out",
              "group-focus-within/cmd-input:text-primary-base",
            )}
          />
        )}
        <CommandMenu.Input
          placeholder="Search pages, actions..."
          value={query}
          onValueChange={handleValueChange}
        />
        <Kbd.Root>
          <CmdIcon className="size-2.5" />K
        </Kbd.Root>
        <CompactButton.Root
          onClick={() => setOpen(false)}
          size="medium"
          variant="ghost"
        >
          <CompactButton.Icon as={RiCloseLine} />
        </CompactButton.Root>
      </div>

      <CommandMenu.List>
        {!hasResults && query.trim() && !isSearching && (
          <div className="px-5 py-8 text-center text-paragraph-sm text-text-sub-600">
            No results found for &quot;{query}&quot;
          </div>
        )}

        {results.map((group) => (
          <CommandMenu.Group
            key={group.id}
            heading={group.label}
            className="[&>[cmdk-group-items]]:overflow-y-auto [&>[cmdk-group-items]]:scroll-smooth"
            style={
              {
                "--max-group-height": `${maxGroupHeight}px`,
              } as React.CSSProperties
            }
          >
            <div
              className="max-h-[var(--max-group-height)] overflow-y-auto scroll-smooth"
              style={{ scrollbarWidth: "none" }}
            >
              {group.items.map((item) => (
                <SearchResultItem
                  key={item.id}
                  item={item}
                  onSelect={() => {
                    item.onSelect();
                    setOpen(false);
                  }}
                />
              ))}
            </div>
          </CommandMenu.Group>
        ))}
      </CommandMenu.List>

      <CommandMenu.Footer>
        <div className="hidden gap-3 md:flex">
          <div className="flex items-center gap-2">
            <CommandMenu.FooterKeyBox>
              <RiArrowUpLine className="size-4" />
            </CommandMenu.FooterKeyBox>
            <CommandMenu.FooterKeyBox>
              <RiArrowDownLine className="size-4" />
            </CommandMenu.FooterKeyBox>
            <span className="text-paragraph-xs text-text-sub-600">
              Navigate
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CommandMenu.FooterKeyBox>
              <RiCornerDownLeftLine className="size-4" />
            </CommandMenu.FooterKeyBox>
            <span className="text-paragraph-xs text-text-sub-600">Select</span>
          </div>
        </div>

        <div className="text-right text-paragraph-xs text-text-sub-600">
          Not what you&apos;re looking for? Try the{" "}
          <LinkButton.Root size="small" underline variant="primary" asChild>
            <Link href={`mailto:${PROJECT.HELP_EMAIL}`}>Help Center</Link>
          </LinkButton.Root>
        </div>
      </CommandMenu.Footer>
    </CommandMenu.Dialog>
  );
}
