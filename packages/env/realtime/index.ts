import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { sharedEnv, sharedEnvSchema } from "../shared";
import type { SharedEnv } from "../shared";

const realtimeVariables = {
  WS_PORT: z.coerce.number().default(3001),
  TCP_PORT: z.coerce.number().default(9000),
  REALTIME_SECRET_KEY: z.string().min(32),
  ALLOWED_ORIGINS: z.string().optional(),
  API_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  RAILWAY_PUBLIC_DOMAIN: z.string().optional(),
  RAILWAY_TCP_PROXY_DOMAIN: z.string().optional(),
  RAILWAY_TCP_PROXY_PORT: z.string().optional(),
  VERCEL_AUTOMATION_BYPASS_SECRET: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
};

const realtimeEnvSchema = z.object(realtimeVariables);
export type RealtimeEnv = z.infer<typeof realtimeEnvSchema> & SharedEnv;

const realtimeOnlyEnv = createEnv({
  server: { ...sharedEnvSchema, ...realtimeVariables },
  runtimeEnv: process.env,
  extends: [sharedEnv],
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
});

export const env: RealtimeEnv = realtimeOnlyEnv as RealtimeEnv;

export const loadRealtimeEnv = (): RealtimeEnv => env;
