import Redis from "ioredis";
import { env } from "@repo/env/apps-web";

const isRedisConfigured = Boolean(env.REDIS_URL);

// Lazy: the studio boots without REDIS_URL. When it is unset, commands fail
// fast instead of retrying a localhost connection forever.
export const redis = new Redis(
  `${env.REDIS_URL ?? "redis://localhost:6379"}?family=0`,
  isRedisConfigured
    ? { lazyConnect: true }
    : {
        lazyConnect: true,
        enableOfflineQueue: false,
        maxRetriesPerRequest: 0,
        retryStrategy: () => null,
      },
);
