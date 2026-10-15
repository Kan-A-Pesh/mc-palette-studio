import { redirect } from "next/navigation";

import { PAGES } from "@/constants/pages";
import { getServerSession } from "@/lib/auth/get-server-session";

import Footer from "../_components/footer";
import BackButton from "./_components/back-button";
import Header from "./_components/header";
import Stepper from "./_components/stepper";

export default async function CreatePage() {
  const session = await getServerSession();
  if (!session) {
    redirect(PAGES.AUTH.SIGN_IN);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="relative isolate mx-auto flex w-full max-w-348 flex-1 flex-col">
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative auth/marketing illustration; next/image adds no value for a static non-LCP asset */}
        <img
          alt=""
          className="-z-10 -translate-x-1/2 pointer-events-none absolute top-0 left-1/2 hidden lg:block"
          height={456}
          src="/images/onboarding-pattern.svg"
          width={964}
        />

        <div className="absolute top-8 left-21 hidden lg:block">
          <BackButton />
        </div>

        <div className="w-full px-6 lg:px-5">
          <Stepper />
        </div>

        <Footer />
      </div>
    </div>
  );
}
