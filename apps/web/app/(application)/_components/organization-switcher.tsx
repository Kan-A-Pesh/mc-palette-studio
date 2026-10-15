"use client";

import {
  RiAddCircleLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiExpandUpDownLine,
} from "@repo/ui/icon";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import * as React from "react";
import * as Avatar from "@repo/ui/avatar";
import * as Divider from "@repo/ui/divider";
import * as Dropdown from "@repo/ui/dropdown";
import { FormGlobalMessage } from "@repo/ui/form";
import { Skeleton } from "@repo/ui/skeleton";
import { toast } from "@repo/ui/toast";
import { PAGES } from "@/constants/pages";
import { authClient } from "@/lib/auth/auth-client";
import { useOrganizationSetActive } from "@/hooks/organization/use-organization-set-active";
import { cn } from "@repo/ui/utils/cn";
import { orpc, type RouterOutput } from "@/orpc/client";
import { formatMemberCount } from "./format-member-count";

type OrganizationWithCount =
  RouterOutput["organization"]["getUserOrganizations"]["organizations"][number];

type OrganizationItemProps = {
  organization: OrganizationWithCount;
  selected: boolean;
  onSelect: (value: string) => void;
};

function OrganizationItem({
  organization,
  selected,
  onSelect,
}: OrganizationItemProps) {
  const getMemberCountText = (count: number) => {
    if (count === 0) return "No members";
    if (count === 1) return "1 member";
    return `${count} members`;
  };

  return (
    <button
      className="group/item flex w-full cursor-pointer items-center gap-3 rounded-10 p-2 text-left outline-none transition duration-200 ease-out hover:bg-bg-weak-50 focus:outline-none"
      onClick={() => onSelect(organization.id)}
      type="button"
    >
      <div className="flex size-10 items-center justify-center rounded-full shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset">
        <Avatar.Root className="size-10" placeholderType="company">
          {organization.logo && <Avatar.Image alt="" src={organization.logo} />}
        </Avatar.Root>
      </div>
      <div className="flex-1 space-y-1">
        <div className="truncate text-label-sm">{organization.name}</div>
        <div className="text-paragraph-xs text-text-sub-600">
          {getMemberCountText(organization.membersCount || 0)}
        </div>
      </div>
      {selected && <RiCheckLine className="size-5 text-text-sub-600" />}
    </button>
  );
}

export function OrganizationSwitcher({ className }: { className?: string }) {
  const queryClient = useQueryClient();
  const { data, isPending, error } = useQuery(
    orpc.organization.getUserOrganizations.queryOptions(),
  );

  const [open, setOpen] = React.useState(false);
  const setActiveOrganizationMutation = useOrganizationSetActive();

  const setSelectedOrg = React.useCallback(
    async (value: string) => {
      try {
        await setActiveOrganizationMutation.mutateAsync({
          organizationId: value,
        });
        queryClient.invalidateQueries({
          queryKey: [["organization"]],
        });
        setOpen(false);
      } catch {
        toast.error("Failed to switch organization");
      }
    },
    [queryClient, setActiveOrganizationMutation],
  );

  if (isPending) {
    return <Skeleton className="h-16 w-full rounded-10" />;
  }

  if (error) {
    return (
      <div className="flex h-16 w-full items-center justify-center rounded-10 bg-bg-weak-50">
        <FormGlobalMessage
          className="w-auto pe-2"
          Icon={RiErrorWarningLine}
          variant="error"
        >
          An error occurred
        </FormGlobalMessage>
      </div>
    );
  }

  return (
    <Dropdown.Root onOpenChange={setOpen} open={open}>
      <Dropdown.Trigger
        className={cn(
          "flex w-full items-center gap-3 whitespace-nowrap rounded-10 p-3 text-left outline-none hover:bg-bg-weak-50 focus:outline-none",
          className,
        )}
      >
        <Avatar.Root className="size-10" placeholderType="company">
          {data?.activeOrganization?.logo && (
            <Avatar.Image alt="" src={data.activeOrganization.logo} />
          )}
        </Avatar.Root>
        <div
          className="flex w-43 shrink-0 items-center gap-3"
          data-hide-collapsed
        >
          <div className="flex-1 space-y-1">
            <div className="max-w-switcher-label truncate text-label-sm">
              {data?.activeOrganization?.name}
            </div>
            <div className="max-w-switcher-label truncate text-paragraph-xs text-text-sub-600">
              {formatMemberCount(data?.activeOrganization?.membersCount)}
            </div>
          </div>
          <div className="flex size-6 items-center justify-center rounded-md border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
            <RiExpandUpDownLine className="size-5 text-text-sub-600" />
          </div>
        </div>
      </Dropdown.Trigger>
      <Dropdown.Content align="start" side="right" sideOffset={24}>
        {data?.organizations?.map((org, i) => (
          <OrganizationItem
            key={i}
            onSelect={(val) => setSelectedOrg(val)}
            organization={org}
            selected={data?.activeOrganization?.id === org.id}
          />
        ))}
        <Divider.Root variant="dotted-line" />

        <Dropdown.Item asChild className="justify-center">
          <Link href={PAGES.ORGANIZATION.CREATE}>
            <Dropdown.ItemIcon as={RiAddCircleLine} />
            Create Organization
          </Link>
        </Dropdown.Item>
      </Dropdown.Content>
    </Dropdown.Root>
  );
}

export function OrganizationSwitcherMobile({
  className,
}: {
  className?: string;
}) {
  const queryClient = useQueryClient();
  const { data, isPending, error } = useQuery(
    orpc.organization.getUserOrganizations.queryOptions(),
  );

  const [open, setOpen] = React.useState(false);

  const setSelectedOrg = React.useCallback(
    async (value: string) => {
      await authClient.organization.setActive({
        organizationId: value,
      });
      queryClient.invalidateQueries({
        queryKey: [["organization"]],
      });
      setOpen(false);
    },
    [queryClient],
  );

  if (isPending) {
    return (
      <div className="flex h-21 w-full items-center justify-center bg-bg-weak-50 p-4">
        <Skeleton className="h-full w-full rounded-10" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-21 w-full items-center justify-center bg-bg-weak-50">
        <FormGlobalMessage
          className="w-auto pe-2"
          Icon={RiErrorWarningLine}
          variant="error"
        >
          An error occurred
        </FormGlobalMessage>
      </div>
    );
  }

  return (
    <Dropdown.Root modal={false} onOpenChange={setOpen} open={open}>
      <Dropdown.Trigger
        className={cn(
          "group flex w-full items-center gap-3 whitespace-nowrap px-4 py-switcher-y text-left outline-none focus:outline-none",
          className,
        )}
      >
        <Avatar.Root className="size-11" placeholderType="company">
          {data?.activeOrganization?.logo && (
            <Avatar.Image alt="" src={data.activeOrganization.logo} />
          )}
        </Avatar.Root>
        <div className="flex-1 space-y-1">
          <div className="truncate text-label-md">
            {data?.activeOrganization?.name}
          </div>
          <div className="truncate text-paragraph-sm text-text-sub-600">
            {formatMemberCount(data?.activeOrganization?.membersCount)}
          </div>
        </div>
        <div
          className={cn(
            "flex size-6 items-center justify-center rounded-md border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 shadow-regular-xs transition duration-200 ease-out",
            // open
            "group-data-[state=open]:border-bg-strong-950 group-data-[state=open]:bg-bg-strong-950 group-data-[state=open]:text-text-white-0",
          )}
        >
          <RiExpandUpDownLine className="size-5" />
        </div>
      </Dropdown.Trigger>
      <Dropdown.Content
        align="end"
        alignOffset={16}
        className=""
        side="bottom"
        sideOffset={-12}
      >
        {data?.organizations?.map((org, i) => (
          <OrganizationItem
            key={i}
            onSelect={(val) => setSelectedOrg(val)}
            organization={org}
            selected={data?.activeOrganization?.id === org.id}
          />
        ))}
        <Divider.Root variant="dotted-line" />

        <Dropdown.Item asChild className="justify-center">
          <Link href={PAGES.ORGANIZATION.CREATE}>
            <Dropdown.ItemIcon as={RiAddCircleLine} />
            Create Organization
          </Link>
        </Dropdown.Item>
      </Dropdown.Content>
    </Dropdown.Root>
  );
}
