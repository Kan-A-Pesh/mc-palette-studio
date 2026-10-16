import type { Metadata } from "next";
import { getRealtimeWebSocketUrl } from "@/lib/realtime/get-realtime-web-socket-url";
import { RealtimeProvider } from "@repo/realtime/client";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const realtimeUrl = getRealtimeWebSocketUrl();

  return <RealtimeProvider url={realtimeUrl}>{children}</RealtimeProvider>;
}
