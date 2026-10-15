"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";

import * as Select from "@repo/ui/select";
import * as TabMenuHorizontal from "@repo/ui/tab-menu-horizontal";

export type AdminItem = {
  label: string;
  key: string;
  href: string;
  disabled?: boolean;
};

interface AdminLayoutClientProps {
  items: AdminItem[];
  children: React.ReactNode;
}

export default function AdminLayoutClient({
  items,
  children,
}: AdminLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();

  const selectedPathname = useMemo(
    () => items.find((item) => pathname.startsWith(item.href))?.href,
    [pathname, items],
  );

  return (
    <div className="px-4 lg:px-8">
      <Select.Root
        defaultValue={selectedPathname}
        onValueChange={(val) => router.push(val)}
      >
        <Select.Trigger className="md:hidden">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {items
            .filter((item) => !item.disabled)
            .map((item) => (
              <Select.Item
                disabled={item.disabled}
                key={item.key}
                value={item.href}
              >
                {item.label}
              </Select.Item>
            ))}
        </Select.Content>
      </Select.Root>

      <TabMenuHorizontal.Root defaultValue={selectedPathname}>
        <TabMenuHorizontal.List className="hidden md:flex">
          {items
            .filter((item) => !item.disabled)
            .map(({ label, href, key }) => (
              <TabMenuHorizontal.Trigger asChild key={key} value={href}>
                <Link href={href}>{label}</Link>
              </TabMenuHorizontal.Trigger>
            ))}
        </TabMenuHorizontal.List>
      </TabMenuHorizontal.Root>

      <div className="py-5 md:py-8">{children}</div>
    </div>
  );
}
