import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PAGES } from "@/constants/pages";
import { getServerSession } from "@/lib/auth/get-server-session";

import Footer from "./_components/footer";
import Header from "./_components/header";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  if (session) {
    redirect(PAGES.APPLICATION.DASHBOARD);
  }

  return (
    <div className="items-cente flex min-h-screen flex-col">
      <Header />
      <div className="relative isolate flex w-full flex-1 flex-col items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative auth/marketing illustration; next/image adds no value for a static non-LCP asset */}
        <img
          alt=""
          className="-z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none absolute top-1/2 left-1/2 w-full max-w-285 object-contain"
          height="318"
          src="/images/auth-pattern.svg"
          width="824"
        />
        {children}
      </div>
      <Footer />
    </div>
  );
}
