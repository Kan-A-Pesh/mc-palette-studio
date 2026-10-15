"use client";

import { RiLogoutBoxRLine } from "@repo/ui/icon";

import * as Button from "@repo/ui/button";
import { PROJECT } from "@repo/env/constants";
import { signOut } from "@/lib/auth/sign-out";

export default function Footer() {
  return (
    <div className="mt-auto flex items-center justify-between gap-4 px-4 pb-4 lg:px-5 lg:pb-6">
      <div className="text-paragraph-sm text-text-sub-600">
        © {new Date().getFullYear()} {PROJECT.COMPANY}
      </div>

      <Button.Root
        mode="ghost"
        onClick={signOut}
        size="small"
        variant="neutral"
      >
        <Button.Icon as={RiLogoutBoxRLine} />
        Logout
      </Button.Root>
    </div>
  );
}
