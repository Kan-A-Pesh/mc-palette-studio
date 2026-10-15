import type { PostHog } from "posthog-node";
import { posthogState } from "./posthog-instance";

export function getAnalyticsClient(): PostHog {
  if (!posthogState.client) {
    throw new Error(
      "Analytics server not initialized. Call initializeAnalyticsServer first.",
    );
  }
  return posthogState.client;
}
