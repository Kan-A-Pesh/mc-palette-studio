import type { Metadata, Viewport } from "next";
import "./globals.css";
import { dmSans } from "./fonts";
import { Providers } from "./providers";
import { cn } from "@repo/ui/utils/cn";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.URL),
  title: {
    default: SITE.TITLE,
    template: `%s · ${SITE.NAME}`,
  },
  description: SITE.DESCRIPTION,
  applicationName: SITE.NAME,
  keywords: [...SITE.KEYWORDS],
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE.NAME,
    locale: "en_US",
    title: SITE.TITLE,
    description: SITE.SHARE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.TITLE,
    description: SITE.SHARE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: SITE.COLORS.CANVAS,
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
