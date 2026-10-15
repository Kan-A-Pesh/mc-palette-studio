import { RedirectType, redirect } from "next/navigation";

import { SearchMenu } from "@/components/search";
import { PAGES } from "@/constants/pages";
import { getServerSession } from "@/lib/auth/get-server-session";
import { cn } from "@repo/ui/utils/cn";
import { api } from "@/orpc/server";
// import { UserIdentifier } from "@/providers/user-identifier"; // TODO: Implement analytics with posthog to enable this (see https://github.com/impulse-studio/ultimate-template/issues)
import HeaderMobile from "./_components/header-mobile";
import { ImpersonationBanner } from "./_components/impersonation-banner";
import Sidebar from "./_components/sidebar";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authResponse = await getServerSession();

  if (!authResponse?.user) {
    redirect(PAGES.AUTH.SIGN_IN, RedirectType.replace);
  }

  const isImpersonating = !!authResponse?.session?.impersonatedBy;

  const { organizations } = await api.organization.getUserOrganizations();
  const userInvitations = await api.organization.listUserInvitations();

  if (userInvitations.length > 0) {
    redirect(PAGES.ORGANIZATION.INVITATIONS, RedirectType.replace);
  }

  if (organizations.length === 0) {
    redirect(PAGES.ORGANIZATION.CREATE, RedirectType.replace);
  }

  return (
    <>
      {/* <UserIdentifier user={authResponse.user} /> */}
      {isImpersonating && (
        <ImpersonationBanner impersonatedUser={authResponse.user} />
      )}
      <div
        className={cn(
          "grid grid-cols-1 content-start items-start lg:grid-cols-[auto_minmax(0,1fr)]",
          {
            "min-h-screen": !isImpersonating,
            "min-h-[calc(100vh-44px)]": isImpersonating,
          },
        )}
      >
        <Sidebar showBanner={isImpersonating} />
        <HeaderMobile />
        <div className="mx-auto flex w-full max-w-340 flex-1 flex-col">
          {children}
        </div>
      </div>

      <SearchMenu />
    </>
  );
}
