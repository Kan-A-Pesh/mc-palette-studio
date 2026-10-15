import type { Metadata } from "next";
import "./globals.css";
import { dmSans } from "./fonts";
import { Providers } from "./providers";
import { cn } from "@repo/ui/utils/cn";

export const metadata: Metadata = {
  title: "Palette Studio",
  description:
    "Minecraft block palettes: variations, patterns and WorldEdit export",
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
