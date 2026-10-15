import { PostHog } from "posthog-node";
import { posthogState } from "./posthog-instance";

export interface AnalyticsServerConfig {
  apiKey: string;
  host?: string;
}

export function initializeAnalyticsServer(config: AnalyticsServerConfig): void {
  posthogState.client = new PostHog(config.apiKey, {
    host: config.host ?? "https://eu.i.posthog.com",
  });
}
