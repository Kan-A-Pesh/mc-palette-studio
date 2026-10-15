import { getRealtimeWebSocketUrl } from "@/lib/realtime/get-realtime-web-socket-url";
import { RealtimeProvider } from "@repo/realtime/client";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const realtimeUrl = getRealtimeWebSocketUrl();

  return <RealtimeProvider url={realtimeUrl}>{children}</RealtimeProvider>;
}
