"use client";

import {
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiErrorWarningLine,
  RiLogoutBoxRLine,
  RiUserSettingsLine,
} from "@repo/ui/icon";
import clsx from "clsx";
import Link from "next/link";

import * as Avatar from "@repo/ui/avatar";
import * as Badge from "@repo/ui/badge";
import * as Divider from "@repo/ui/divider";
import * as Dropdown from "@repo/ui/dropdown";
import * as Switch from "@repo/ui/switch";
import { PAGES } from "@/constants/pages";
import type { Subscription, User } from "@repo/database";
import { type BadgeColor, useUserData } from "@/hooks/use-user-data";
import { cn } from "@repo/ui/utils/cn";
import { signOut } from "@/lib/auth/sign-out";

export function UserButtonSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-3 whitespace-nowrap rounded-10 p-3 text-left",
        className,
      )}
    >
      <Avatar.Root className="animate-pulse" size="40" />
      <div className="flex-1 space-y-1" data-hide-collapsed>
        <div className="h-4 w-24 animate-pulse rounded bg-bg-weak-50" />
        <div className="h-3 w-32 animate-pulse rounded bg-bg-weak-50" />
      </div>
    </div>
  );
}

type AvatarColor = "yellow" | "gray" | "blue" | "purple" | "sky" | "red";

function UserAvatar({
  user,
  color = "yellow" as const,
}: {
  user?: { image?: string | null };
  color?: AvatarColor;
}) {
  return (
    <Avatar.Root color={color} size="40">
      {user?.image && <Avatar.Image alt="" src={user.image} />}
    </Avatar.Root>
  );
}

function ErrorState({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-3 whitespace-nowrap rounded-10 p-3 text-left text-red-500",
        className,
      )}
    >
      <Avatar.Root color="red" size="40">
        <div className="flex items-center justify-center">
          <RiErrorWarningLine className="size-5" />
        </div>
      </Avatar.Root>
      <div className="flex-1 space-y-1" data-hide-collapsed>
        <div className="text-label-sm">Session Error</div>
        <div className="text-paragraph-xs">Try reloading the page</div>
      </div>
    </div>
  );
}

function UserInfo({
  user,
  subscription,
  planBadgeColor,
  planLabel,
  className,
  labelSize = "sm",
  paragraphSize = "xs",
}: {
  user?: User;
  subscription: Subscription | null;
  planBadgeColor: BadgeColor;
  planLabel: string;
  className?: string;
  labelSize?: "sm" | "md";
  paragraphSize?: "xs" | "sm";
}) {
  return (
    <div className={cn("min-w-0 flex-1 space-y-1", className)}>
      <div className={cn("flex items-center gap-1", `text-label-${labelSize}`)}>
        <span className="truncate">{user?.name}</span>
        {subscription && (
          <Badge.Root
            className="flex-shrink-0"
            color={planBadgeColor}
            size="small"
            variant="lighter"
          >
            {planLabel}
          </Badge.Root>
        )}
      </div>
      <div
        className={cn(
          "truncate text-text-sub-600",
          `text-paragraph-${paragraphSize}`,
        )}
      >
        {user?.email}
      </div>
    </div>
  );
}

function UserHeader() {
  const { user, getPlanBadgeColor, getPlanLabel } = useUserData();
  const planBadgeColor = getPlanBadgeColor();
  const planLabel = getPlanLabel();

  return (
    <div className="mb-1 px-2 py-2">
      <div className="flex items-center gap-3">
        <UserAvatar color="yellow" user={user} />
        <div className="flex flex-1 items-center justify-between gap-2">
          <div>
            <div className="font-medium text-label-sm">{user?.name}</div>
            <div className="text-paragraph-sm text-text-sub-600">
              {user?.email}
            </div>
          </div>
          {user?.subscription && (
            <Badge.Root color={planBadgeColor} size="small" variant="lighter">
              {planLabel}
            </Badge.Root>
          )}
        </div>
      </div>
    </div>
  );
}

function DropdownContent() {
  const { isDarkTheme, getThemeIcon, getThemeText, handleThemeChange } =
    useUserData();

  const ThemeIcon = getThemeIcon();

  return (
    <>
      <UserHeader />
      <Dropdown.Item
        onSelect={(e) => {
          e.preventDefault();
          handleThemeChange();
        }}
      >
        <Dropdown.ItemIcon as={ThemeIcon} />
        {getThemeText()}
        <span className="flex-1" />
        <Switch.Root checked={isDarkTheme} />
      </Dropdown.Item>
      <Divider.Root variant="dotted-line" />
      <Dropdown.Group>
        <Dropdown.Item asChild>
          <Link href={PAGES.APPLICATION.SETTINGS.ACCOUNT}>
            <Dropdown.ItemIcon as={RiUserSettingsLine} />
            Account settings
          </Link>
        </Dropdown.Item>
      </Dropdown.Group>
      <Dropdown.Group>
        <Dropdown.Item onClick={signOut}>
          <Dropdown.ItemIcon as={RiLogoutBoxRLine} />
          Logout
        </Dropdown.Item>
      </Dropdown.Group>
      <div className="p-2 text-paragraph-sm text-text-soft-400">
        <Link href={PAGES.MARKETING.TERMS_AND_CONDITIONS}>
          Terms & Conditions
        </Link>
      </div>
    </>
  );
}

// Shared loading/error guard for the user-button variants. Returns a `guard`
// element to render early when data isn't ready, plus the resolved user data.
function useUserButtonContent(className?: string) {
  const { user, isLoading, error, getPlanBadgeColor, getPlanLabel } =
    useUserData();

  const guard = isLoading ? (
    <UserButtonSkeleton className={className} />
  ) : error ? (
    <ErrorState className={className} />
  ) : null;

  return { guard, user, getPlanBadgeColor, getPlanLabel };
}

export function UserButton({ className }: { className?: string }) {
  const { guard, user, getPlanBadgeColor, getPlanLabel } =
    useUserButtonContent(className);

  if (guard) return guard;

  return (
    <Dropdown.Root>
      <Dropdown.Trigger
        className={cn(
          "flex w-full items-center gap-3 whitespace-nowrap rounded-10 p-3 text-left outline-none hover:bg-bg-weak-50 focus:outline-none",
          className,
        )}
      >
        <UserAvatar user={user} />
        <div
          className="flex w-43 shrink-0 items-center gap-3"
          data-hide-collapsed
        >
          <UserInfo
            planBadgeColor={getPlanBadgeColor()}
            planLabel={getPlanLabel()}
            subscription={user?.subscription || null}
            user={user}
          />

          <div className="flex size-6 items-center justify-center rounded-md">
            <RiArrowRightSLine className="size-5 text-text-sub-600" />
          </div>
        </div>
      </Dropdown.Trigger>
      <Dropdown.Content align="end" side="right" sideOffset={24}>
        <DropdownContent />
      </Dropdown.Content>
    </Dropdown.Root>
  );
}

export function UserButtonMobile({ className }: { className?: string }) {
  const { guard, user, getPlanBadgeColor, getPlanLabel } =
    useUserButtonContent(className);

  if (guard) return guard;

  return (
    <Dropdown.Root modal={false}>
      <Dropdown.Trigger
        className={cn(
          "group flex w-full items-center gap-3 whitespace-nowrap rounded-10 p-3 text-left outline-none hover:bg-bg-weak-50 focus:outline-none",
          className,
        )}
      >
        <UserAvatar user={user} />
        <UserInfo
          labelSize="md"
          paragraphSize="sm"
          planBadgeColor={getPlanBadgeColor()}
          planLabel={getPlanLabel()}
          subscription={user?.subscription || null}
          user={user}
        />
        <div
          className={clsx(
            "flex size-6 items-center justify-center rounded-md border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 shadow-regular-xs",
            // open
            "group-data-[state=open]:bg-bg-strong-950 group-data-[state=open]:text-text-white-0 group-data-[state=open]:shadow-none",
          )}
        >
          <RiArrowDownSLine className="group-data-[state=open]:-rotate-180 size-5" />
        </div>
      </Dropdown.Trigger>
      <Dropdown.Content align="end" side="top">
        <DropdownContent />
      </Dropdown.Content>
    </Dropdown.Root>
  );
}
