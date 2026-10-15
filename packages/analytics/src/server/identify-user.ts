import { getAnalyticsClient } from "./get-analytics-client";

export function identifyUser(
  userId: string,
  traits: Record<string, unknown>,
): void {
  const client = getAnalyticsClient();
  client.identify({
    distinctId: userId,
    properties: traits,
  });
}
