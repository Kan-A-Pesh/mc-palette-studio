import { RiAdminLine } from "@repo/ui/icon";
import { redirect } from "next/navigation";

import Header from "@/app/(application)/_components/header";
import { PAGES } from "@/constants/pages";
import { getServerSession } from "@/lib/auth/get-server-session";

import AdminLayoutClient from "./_components/admin-layout-client";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  if (!session?.user || session.user.role !== "admin") {
    redirect(PAGES.APPLICATION.DASHBOARD);
  }

  return (
    <>
      <Header
        contentClassName="hidden"
        description="Manage your application settings and users"
        icon={
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset">
            <RiAdminLine className="size-6 text-text-sub-600" />
          </div>
        }
        title="Admin Dashboard"
      />

      <AdminLayoutClient
        items={[
          {
            label: "Manage Users",
            key: "users",
            href: PAGES.ADMIN.USERS,
          },
          {
            label: "Application Settings",
            key: "settings",
            href: PAGES.ADMIN.SETTINGS,
            disabled: true,
          },
        ]}
      >
        {children}
      </AdminLayoutClient>
    </>
  );
}
