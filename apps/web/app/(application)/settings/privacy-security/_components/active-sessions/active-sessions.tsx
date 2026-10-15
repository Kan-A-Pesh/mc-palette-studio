"use client";

import {
  RiChromeLine,
  RiCloseLine,
  RiFirefoxLine,
  RiMacbookLine,
  RiSmartphoneLine,
} from "@repo/ui/icon";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

import * as Button from "@repo/ui/button";
import * as Divider from "@repo/ui/divider";
import { authClient } from "@/lib/auth/auth-client";
import { SessionSkeleton } from "./session-skeleton";

export default function ActiveSessions() {
  const {
    data: sessions,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["user-sessions"],
    queryFn: () => authClient.listSessions(),
  });

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes("iPhone") || userAgent.includes("Android")) {
      return RiSmartphoneLine;
    }
    if (userAgent.includes("Mac")) {
      return RiMacbookLine;
    }
    if (userAgent.includes("Firefox")) {
      return RiFirefoxLine;
    }
    if (userAgent.includes("Chrome")) {
      return RiChromeLine;
    }
    return RiChromeLine; // default
  };

  const getDeviceName = (userAgent: string) => {
    if (userAgent?.includes("Android")) {
      return "Android";
    }
    if (userAgent?.includes("iPhone")) {
      return "Apple iPhone";
    }
    if (userAgent?.includes("iPad")) {
      return "Apple iPad";
    }
    if (userAgent?.includes("Mac")) {
      return "Apple Mac";
    }
    if (userAgent?.includes("Firefox")) {
      return "Mozilla Firefox";
    }
    if (userAgent?.includes("Chrome")) {
      return "Google Chrome";
    }
    return "Unknown device";
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div>
        <div className="text-label-md">Active Sessions</div>
        <p className="mt-1 text-paragraph-sm text-text-sub-600">
          Monitor and manage all your active sessions.
        </p>
      </div>

      <Divider.Root variant="line-spacing" />

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <>
            <SessionSkeleton />
            <SessionSkeleton />
          </>
        ) : (
          sessions?.data?.map((session) => {
            const Icon = getDeviceIcon(session.userAgent ?? "unknown");
            return (
              <div
                className="flex items-center gap-3.5 rounded-xl bg-bg-white-0 p-4 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset"
                key={session.token}
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-faded-lighter">
                  <Icon className="size-5 text-text-sub-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-label-sm">
                    {getDeviceName(session.userAgent ?? "unknown")}
                    <span className="ml-1 text-paragraph-xs text-text-sub-600">
                      (
                      {formatDistanceToNow(session.createdAt, {
                        addSuffix: true,
                      })}
                      )
                    </span>
                  </div>
                  <div className="max-w-50 truncate text-paragraph-xs text-text-sub-600">
                    {session.ipAddress}
                  </div>
                </div>
                <button
                  onClick={() => {
                    authClient
                      .revokeSession({
                        token: session.token,
                      })
                      .then(() => {
                        refetch();
                      });
                  }}
                  type="button"
                >
                  <RiCloseLine className="size-5 text-text-sub-600" />
                </button>
              </div>
            );
          })
        )}
      </div>

      <Button.Root
        className="mt-1 w-full"
        mode="stroke"
        onClick={() => {
          authClient.revokeOtherSessions().then(() => {
            refetch();
          });
        }}
        variant="error"
      >
        Sign out all other devices
      </Button.Root>
    </div>
  );
}
