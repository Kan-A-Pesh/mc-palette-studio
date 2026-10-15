import type { PostHog } from "posthog-node";

export const posthogState: { client: PostHog | null } = {
  client: null,
};
