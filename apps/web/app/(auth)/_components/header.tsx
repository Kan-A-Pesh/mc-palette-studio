"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Logo } from "@/components/branding/logo";
import * as LinkButton from "@repo/ui/link-button";
import { PAGES } from "@/constants/pages";
import { actions } from "./header-actions";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const action = actions[pathname as keyof typeof actions];
  if (!action) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-350 items-center justify-between p-6">
      <Link href={PAGES.MARKETING.HOME}>
        <Logo className="size-10 shrink-0" />
      </Link>

      <div className="flex items-center gap-1.5">
        <div className="text-paragraph-sm text-text-sub-600">{action.text}</div>
        <LinkButton.Root asChild size="medium" underline variant="primary">
          {action.link.href ? (
            <Link href={action.link.href}>{action.link.label}</Link>
          ) : (
            <button
              className="cursor-pointer border-none bg-transparent p-0 text-inherit underline"
              onClick={() => router.back()}
              type="button"
            >
              {action.link.label}
            </button>
          )}
        </LinkButton.Root>
      </div>
    </div>
  );
}
