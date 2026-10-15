import { posthogState } from "./posthog-instance";

export async function shutdownAnalytics(): Promise<void> {
  if (posthogState.client) {
    await posthogState.client.shutdown();
    posthogState.client = null;
  }
}
