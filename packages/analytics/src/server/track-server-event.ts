import type { AnalyticsEventName, AnalyticsEventProperties } from "../events";
import { getAnalyticsClient } from "./get-analytics-client";

export function trackServerEvent<E extends AnalyticsEventName>(
  userId: string,
  event: E,
  properties: AnalyticsEventProperties[E],
): void {
  const client = getAnalyticsClient();
  client.capture({
    distinctId: userId,
    event,
    properties,
  });
}
