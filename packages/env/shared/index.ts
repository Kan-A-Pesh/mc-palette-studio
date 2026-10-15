import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const sharedEnvSchema = {
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
};

export const sharedEnv = createEnv({
  server: sharedEnvSchema,
  runtimeEnv: process.env,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
});

export type SharedEnv = typeof sharedEnv;
