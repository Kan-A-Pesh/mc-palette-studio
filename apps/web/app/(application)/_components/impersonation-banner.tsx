"use client";

import { RiCloseLine, RiUserStarLine } from "@repo/ui/icon";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "better-auth";
import { useRouter } from "next/navigation";

import * as Banner from "@repo/ui/banner";
import * as LinkButton from "@repo/ui/link-button";

import { stopImpersonating } from "../_lib/stop-impersonating";

interface ImpersonationBannerProps {
  impersonatedUser: User;
}

export function ImpersonationBanner({
  impersonatedUser,
}: ImpersonationBannerProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleStopImpersonation = () => {
    stopImpersonating(queryClient, router);
  };

  return (
    <Banner.Root
      className="sticky top-0 z-50 w-full rounded-none"
      status="warning"
      variant="filled"
    >
      <Banner.Content>
        <Banner.Icon as={RiUserStarLine} />
        <span className="text-label-sm">
          {`Admin mode: You are viewing the application as ${impersonatedUser.name}`}
        </span>
        <LinkButton.Root
          className="ml-auto"
          onClick={handleStopImpersonation}
          size="medium"
          underline
          variant="modifiable"
        >
          Return to admin view
        </LinkButton.Root>
      </Banner.Content>
      <Banner.CloseButton onClick={handleStopImpersonation}>
        <RiCloseLine className="size-5" />
      </Banner.CloseButton>
    </Banner.Root>
  );
}
