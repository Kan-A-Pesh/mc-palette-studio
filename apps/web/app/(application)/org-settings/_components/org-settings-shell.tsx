"use client";

import { RiAddLine, RiSettings2Line } from "@repo/ui/icon";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import Header from "@/app/(application)/_components/header";
import * as Button from "@repo/ui/button";
import * as Divider from "@repo/ui/divider";
import * as Select from "@repo/ui/select";
import * as TabMenuHorizontal from "@repo/ui/tab-menu-horizontal";
import { PAGES } from "@/constants/pages";

import { AddMemberModal } from "../members/_components/add-member-modal";

type SettingsItem = {
  label: string;
  key: string;
  href: string;
  disabled?: boolean;
};

export function OrgSettingsShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  const items: SettingsItem[] = [
    {
      label: "General Settings",
      key: "general",
      href: PAGES.APPLICATION.ORG_SETTINGS.GENERAL,
    },
    {
      label: "Member Settings",
      key: "members",
      href: PAGES.APPLICATION.ORG_SETTINGS.MEMBERS,
    },
  ];

  const selectedPathname = useMemo(
    () => items.find((item) => pathname.startsWith(item.href))?.href,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- items is a stable module-level array; only pathname drives recompute
    [pathname, items.find],
  );

  return (
    <>
      <Header
        description="Manage your organization's settings and preferences"
        icon={
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset">
            <RiSettings2Line className="size-6 text-text-sub-600" />
          </div>
        }
        title="Organization Settings"
      >
        <Button.Root
          className="w-full sm:ms-auto sm:w-auto"
          mode="filled"
          onClick={() => setIsAddMemberModalOpen(true)}
          variant="primary"
        >
          <Button.Icon as={RiAddLine} />
          Add Member
        </Button.Root>
      </Header>

      <div className="px-4 lg:px-8">
        <Select.Root
          defaultValue={selectedPathname}
          onValueChange={(val) => router.push(val)}
        >
          <Select.Trigger className="mt-4 md:hidden">
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

        <Divider.Root />

        <TabMenuHorizontal.Root defaultValue={selectedPathname}>
          <TabMenuHorizontal.List className="hidden border-t-0 md:flex">
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

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onOpenChange={setIsAddMemberModalOpen}
      />
    </>
  );
}
