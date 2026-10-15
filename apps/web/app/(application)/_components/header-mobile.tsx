"use client";

import Link from "next/link";

import { Logo } from "@/components/branding/logo";
import { SearchMenuButton } from "@/components/search";
import { PAGES } from "@/constants/pages";

import MobileMenu from "./mobile-menu";

export default function HeaderMobile() {
  return (
    <div className="flex h-15 w-full items-center justify-between border-stroke-soft-200 border-b px-4 lg:hidden">
      <Link className="shrink-0" href={PAGES.MARKETING.HOME}>
        <Logo className="size-7" />
      </Link>

      <div className="flex gap-3">
        <SearchMenuButton />

        <div className="flex w-1 shrink-0 items-center before:h-full before:w-px before:bg-stroke-soft-200" />

        <MobileMenu />
      </div>
    </div>
  );
}
