import Link from "next/link";
import { RiArrowRightLine, RiLoginBoxLine, RiUserAddLine } from "@repo/ui/icon";
import { PAGES } from "@/constants/pages";
import { CookieSettingsButton } from "@/components/cookies";
import { features, examples, authLinks } from "./home-constants";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg-white-0">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <header className="text-center">
          <h1 className="text-title-h2 text-text-strong-950 lg:text-title-h1">
            Ultimate Template
          </h1>
          <p className="mt-4 text-paragraph-lg text-text-sub-600">
            A production-ready Next.js monorepo with real-time capabilities
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href={PAGES.AUTH.SIGN_IN}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-base px-5 py-2.5 text-label-md text-static-white transition duration-200 ease-out hover:bg-primary-darker"
            >
              <RiLoginBoxLine className="size-4" />
              Sign In
            </Link>
            <Link
              href={PAGES.AUTH.SIGN_UP}
              className="inline-flex items-center gap-2 rounded-lg bg-bg-weak-50 px-5 py-2.5 text-label-md text-text-strong-950 ring-1 ring-stroke-soft-200 ring-inset transition duration-200 ease-out hover:bg-bg-soft-200"
            >
              <RiUserAddLine className="size-4" />
              Sign Up
            </Link>
          </div>
        </header>

        <section className="mt-16">
          <h2 className="text-subheading-xs uppercase text-text-soft-400">
            Included Features
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl bg-bg-white-0 p-4 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset"
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-primary-alpha-10">
                  <feature.icon className="size-5 text-primary-base" />
                </div>
                <h3 className="mt-3 text-label-md text-text-strong-950">
                  {feature.title}
                </h3>
                <p className="mt-1 text-paragraph-sm text-text-sub-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-subheading-xs uppercase text-text-soft-400">
            Real-time Examples
          </h2>
          <p className="mt-2 text-paragraph-sm text-text-sub-600">
            These examples demonstrate the real-time capabilities. Make sure to
            configure{" "}
            <code className="rounded bg-bg-weak-50 px-1.5 py-0.5 text-label-xs text-primary-base">
              NEXT_PUBLIC_REALTIME_URL
            </code>{" "}
            and run the realtime broker.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {examples.map((example) => (
              <Link
                key={example.href}
                href={example.href}
                className="group rounded-xl bg-bg-white-0 p-6 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset transition duration-200 ease-out hover:shadow-regular-md hover:ring-transparent"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-primary-alpha-10 transition duration-200 ease-out group-hover:bg-primary-base">
                  <example.icon className="size-6 text-primary-base transition duration-200 ease-out group-hover:text-static-white" />
                </div>
                <h3 className="mt-4 text-label-md text-text-strong-950">
                  {example.title}
                </h3>
                <p className="mt-2 text-paragraph-sm text-text-sub-600">
                  {example.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-label-sm text-primary-base">
                  Try it
                  <RiArrowRightLine className="size-4 transition duration-200 ease-out group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-subheading-xs uppercase text-text-soft-400">
            Get Started
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {authLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-xl bg-bg-white-0 p-6 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset transition duration-200 ease-out hover:shadow-regular-md hover:ring-transparent"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-primary-alpha-10 transition duration-200 ease-out group-hover:bg-primary-base">
                  <link.icon className="size-6 text-primary-base transition duration-200 ease-out group-hover:text-static-white" />
                </div>
                <h3 className="mt-4 text-label-md text-text-strong-950">
                  {link.title}
                </h3>
                <p className="mt-2 text-paragraph-sm text-text-sub-600">
                  {link.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-label-sm text-primary-base">
                  Continue
                  <RiArrowRightLine className="size-4 transition duration-200 ease-out group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-subheading-xs uppercase text-text-soft-400">
            Project Structure
          </h2>
          <div className="mt-6 overflow-hidden rounded-xl bg-bg-weak-50 p-6 ring-1 ring-stroke-soft-200 ring-inset">
            <pre className="overflow-x-auto font-mono text-paragraph-sm text-text-strong-950">
              {`├── apps/
│   ├── web/              # Next.js application
│   └── realtime/         # Socket.IO broker (Railway)
│
├── packages/
│   ├── database/         # Drizzle ORM + Better Auth
│   ├── server/           # oRPC routers and procedures
│   ├── realtime/         # Real-time types and client
│   ├── email/            # React Email templates
│   ├── env/              # Environment validation
│   └── ui/               # Shared UI components`}
            </pre>
          </div>
        </section>

        <footer className="mt-16 border-t border-stroke-soft-200 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-paragraph-sm text-text-soft-400">
              Built with Next.js, oRPC, Drizzle, Socket.IO, and ❤️
            </p>
            <nav className="flex items-center gap-6">
              <Link
                href={PAGES.MARKETING.PRIVACY_POLICY}
                className="text-paragraph-sm text-text-sub-600 transition duration-200 ease-out hover:text-text-strong-950"
              >
                Privacy Policy
              </Link>
              <Link
                href={PAGES.MARKETING.TERMS_AND_CONDITIONS}
                className="text-paragraph-sm text-text-sub-600 transition duration-200 ease-out hover:text-text-strong-950"
              >
                Terms & Conditions
              </Link>
              <CookieSettingsButton className="text-paragraph-sm text-text-sub-600 transition duration-200 ease-out hover:text-text-strong-950" />
            </nav>
          </div>
        </footer>
      </div>
    </main>
  );
}
