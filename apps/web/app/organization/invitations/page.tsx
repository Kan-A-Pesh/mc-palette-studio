import { RiMailUnreadFill } from "@repo/ui/icon";
import Link from "next/link";
import { redirect } from "next/navigation";

import { InvitationCard } from "@/app/organization/invitations/_components/invitation-card";
import { IllustrationEmptySavedActions } from "@repo/ui/illustrations";
import * as Divider from "@repo/ui/divider";
import * as LinkButton from "@repo/ui/link-button";
import { PAGES } from "@/constants/pages";
import { getServerSession } from "@/lib/auth/get-server-session";
import { cn } from "@repo/ui/utils/cn";

import Footer from "../_components/footer";
import { api } from "@/orpc/server";

export default async function InvitationsPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect(PAGES.AUTH.SIGN_IN);
  }

  const invitations = await api.organization.listUserInvitations();

  const hasPendingInvitations = invitations.length > 0;

  if (!hasPendingInvitations) {
    redirect(PAGES.APPLICATION.DASHBOARD);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="relative isolate flex w-full flex-1 flex-col items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative auth/marketing illustration; next/image adds no value for a static non-LCP asset */}
        <img
          alt=""
          className="-z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none absolute top-1/2 left-1/2 w-full max-w-285 object-contain"
          height="318"
          src="/images/auth-pattern.svg"
          width="824"
        />

        <div className="w-full max-w-118 px-4">
          <section className="flex w-full flex-col gap-6 rounded-20 bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset md:p-8">
            <div className="flex flex-col items-center gap-2">
              {/* icon */}
              <div
                className={cn(
                  "relative flex size-17 shrink-0 items-center justify-center rounded-full backdrop-blur-xl lg:size-24",
                  // bg
                  "before:absolute before:inset-0 before:rounded-full",
                  "before:bg-linear-to-b before:from-neutral-500 before:to-transparent before:opacity-10",
                )}
              >
                <div className="relative z-10 flex size-12 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset lg:size-16">
                  <RiMailUnreadFill className="size-6 text-text-sub-600 lg:size-8" />
                </div>
              </div>

              <div className="space-y-1 text-center">
                <div className="text-title-h6 lg:text-title-h5">
                  Organization Invitations
                </div>
                <div className="text-paragraph-sm text-text-sub-600 lg:text-paragraph-md">
                  You have been invited to the following organizations
                </div>
              </div>
            </div>

            <Divider.Root />

            <div className="flex flex-col gap-4">
              {hasPendingInvitations ? (
                invitations.map((invitation) => (
                  <InvitationCard invitation={invitation} key={invitation.id} />
                ))
              ) : (
                <div className="flex flex-col items-center gap-6 py-4">
                  <IllustrationEmptySavedActions className="h-24 w-24" />
                  <div className="text-center text-paragraph-sm text-text-sub-600">
                    You have no pending invitations
                  </div>
                </div>
              )}
            </div>

            <div className="text-center">
              <LinkButton.Root asChild size="medium" underline variant="gray">
                <Link
                  className="text-paragraph-sm text-text-sub-600"
                  href={`${PAGES.ORGANIZATION.CREATE}`}
                >
                  Create your own organization instead
                </Link>
              </LinkButton.Root>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
