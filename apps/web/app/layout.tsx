import type { Metadata } from "next";
import "./globals.css";
import { dmSans } from "./fonts";
import { Providers } from "./providers";
import { cn } from "@repo/ui/utils/cn";

export const metadata: Metadata = {
  title: "Next.js turborepo template",
  description: "A template for a Next.js project with Better Auth and Drizzle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(dmSans.className, "antialiased")}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
