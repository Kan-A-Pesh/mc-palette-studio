import Redis from "ioredis";
import { env } from "@repo/env/apps-web";

// Lazy: the studio boots without REDIS_URL; only rate-limited calls connect.
export const redis = new Redis(
  `${env.REDIS_URL ?? "redis://localhost:6379"}?family=0`,
  {
    lazyConnect: true,
  },
);
