"use client";

import {
  RiArrowRightSLine,
  RiCloseFill,
  RiHeadphoneLine,
  RiMenu3Fill,
  RiSearch2Line,
  RiSettings2Line,
} from "@repo/ui/icon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { useMediaQuery } from "usehooks-ts";

import { OrganizationSwitcherMobile } from "@/app/(application)/_components/organization-switcher";
import { getNavigationLinks } from "@/app/(application)/_components/sidebar/navigation-links";
import { UserButtonMobile } from "@/app/(application)/_components/user-button";
import * as Modal from "@repo/ui/modal";
import * as TopbarItemButton from "@repo/ui/topbar-item-button";
import { PAGES } from "@/constants/pages";
import { cn } from "@repo/ui/utils/cn";

export default function MobileMenu() {
  const lg = useMediaQuery("(min-width: 1024px)");
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  const navigationLinks = getNavigationLinks();

  React.useEffect(() => {
    setOpen(false);
  }, []);

  React.useEffect(() => {
    if (lg) {
      setOpen(false);
    }
  }, [lg]);

  return (
    <Modal.Root onOpenChange={setOpen} open={open}>
      <Modal.Trigger asChild>
        <TopbarItemButton.Root>
          <TopbarItemButton.Icon as={RiMenu3Fill} />
        </TopbarItemButton.Root>
      </Modal.Trigger>
      <Modal.Content
        showClose={false}
        overlayClassName={cn(
          "z-50 origin-top-right items-stretch justify-start bg-bg-white-0 p-0 backdrop-blur-none",
          // animation
          "data-[state=closed]:animate-out",
        )}
        className={cn(
          "flex size-full max-w-full origin-top-right flex-col overflow-auto rounded-none bg-bg-white-0 shadow-none focus:outline-none",
          // animation
          "data-[state=closed]:animate-out data-[state=open]:animate-in",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        )}
      >
        <Modal.Title className="sr-only">Mobile Menu</Modal.Title>
        <Modal.Description className="sr-only">
          This menu provides mobile navigation options, including access to main
          navigation links, favorite projects, search, and user settings.
        </Modal.Description>

        <div className="flex h-15 w-full shrink-0 items-center border-stroke-soft-200 border-b px-4">
          <div className="relative flex-1">
            <RiSearch2Line className="-translate-y-1/2 absolute top-1/2 left-0 size-6 text-text-soft-400" />
            <input
              className="h-6 w-full pl-9 text-paragraph-md outline-none placeholder:text-text-sub-600 focus:outline-none dark:bg-bg-white-0"
              placeholder="Search..."
              type="text"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex gap-1">
              <TopbarItemButton.Root>
                <TopbarItemButton.Icon as={RiHeadphoneLine} />
              </TopbarItemButton.Root>
              <TopbarItemButton.Root asChild>
                <Link href={PAGES.APPLICATION.SETTINGS.ACCOUNT}>
                  <TopbarItemButton.Icon as={RiSettings2Line} />
                </Link>
              </TopbarItemButton.Root>
            </div>
            <div className="flex w-1 shrink-0 items-center before:h-full before:w-px before:bg-stroke-soft-200" />
            <Modal.Close asChild>
              <TopbarItemButton.Root>
                <TopbarItemButton.Icon as={RiCloseFill} />
              </TopbarItemButton.Root>
            </Modal.Close>
          </div>
        </div>
        <OrganizationSwitcherMobile />

        <div className="flex-1 py-6">
          <div className="flex flex-col gap-5 px-5">
            {navigationLinks.map(({ icon: Icon, label, href, disabled }) => (
              <Link
                aria-current={pathname === href ? "page" : undefined}
                aria-disabled={disabled}
                className={cn(
                  "group relative flex w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-5 py-2 text-text-sub-600 transition duration-200 ease-out hover:bg-bg-weak-50",
                  "aria-[current=page]:bg-bg-weak-50",
                  "aria-[disabled]:pointer-events-none aria-[disabled]:opacity-50",
                )}
                href={href}
                key={href}
              >
                <Icon
                  className={cn(
                    "size-nav-indent shrink-0 text-text-sub-600 transition duration-200 ease-out",
                    "group-aria-[current=page]:text-primary-base",
                  )}
                />
                <div className="flex-1 text-label-md">{label}</div>
                <div
                  className={cn(
                    "-translate-y-1/2 absolute top-1/2 left-0 h-5 w-1 origin-left rounded-r-full bg-primary-base transition duration-200 ease-out",
                    {
                      "scale-100": pathname === href,
                      "scale-0": pathname !== href,
                    },
                  )}
                />
                {pathname === href && (
                  <RiArrowRightSLine className="size-6 text-text-sub-600" />
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="p-2">
          <UserButtonMobile />
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}
