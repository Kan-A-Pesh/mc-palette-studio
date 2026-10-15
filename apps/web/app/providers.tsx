import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@repo/ui/toast";
import { Provider as TooltipProvider } from "@repo/ui/tooltip";
import { AnalyticsProvider } from "@repo/analytics/client";
import { env } from "@repo/env/apps-web";
import { ORPCQueryClientProvider } from "@/providers/query-client.provider";
import { CookieBanner } from "@/components/cookies";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AnalyticsProvider
      apiKey={env.NEXT_PUBLIC_POSTHOG_KEY ?? ""}
      host={env.NEXT_PUBLIC_POSTHOG_HOST}
      enabled={!!env.NEXT_PUBLIC_POSTHOG_KEY}
    >
      <ORPCQueryClientProvider>
        <ThemeProvider attribute="class">
          <NuqsAdapter>
            <TooltipProvider>{children}</TooltipProvider>
          </NuqsAdapter>
          <Toaster expand={false} position="bottom-right" richColors />
          <CookieBanner enabled={!!env.NEXT_PUBLIC_POSTHOG_KEY} />
        </ThemeProvider>
      </ORPCQueryClientProvider>
    </AnalyticsProvider>
  );
}
