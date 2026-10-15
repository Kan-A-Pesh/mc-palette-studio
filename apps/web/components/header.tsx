"use client";

import Link from "next/link";

import { PROJECT } from "@repo/env/constants";

import { Logo } from "./branding/logo";
import { ThemeSwitchWrapper } from "./theme-switch-wrapper";

export default function Header() {
  return (
    <div className="border-stroke-soft-200 border-b">
      <header className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
        <Link
          className="flex items-center gap-2 font-mono text-label-md text-text-strong-950"
          href="/"
        >
          <Logo className="size-7" />
          {PROJECT.NAME}
        </Link>
        <ThemeSwitchWrapper />
      </header>
    </div>
  );
}
