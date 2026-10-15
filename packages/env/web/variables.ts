import { z } from "zod";

export const serverVariables = {
  BETTER_AUTH_SECRET: z.string(),

  REDIS_URL: z.string().url(),
  BLOB_READ_WRITE_TOKEN: z.string().min(1),

  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().min(1),

  REALTIME_TCP_URL: z.string().url().optional(),
  REALTIME_SECRET_KEY: z.string().min(32).optional(),

  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),

  VERCEL_URL: z.string().optional(),
  VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
  VERCEL_BRANCH_URL: z.string().optional(),
  VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
  VERCEL_GIT_COMMIT_SHA: z.string().optional(),
  VERCEL_GIT_PULL_REQUEST_ID: z.string().optional(),
};

export const clientVariables = {
  NEXT_PUBLIC_REACT_SCAN_DEVTOOLS: z.enum(["true", "false"]).default("false"),
  NEXT_PUBLIC_REACT_QUERY_DEVTOOLS: z.enum(["true", "false"]).default("false"),
  NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: z.string().optional(),
  NEXT_PUBLIC_VERCEL_ENV: z
    .enum(["development", "preview", "production"])
    .optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
  NEXT_PUBLIC_REALTIME_WS_URL: z.string().url().optional(),
};

export const serverEnvSchema = z.object(serverVariables);
export const clientEnvSchema = z.object(clientVariables);

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;
