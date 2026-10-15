import { createEnv } from "@t3-oss/env-nextjs";
import { sharedEnv, sharedEnvSchema } from "../shared";
import {
  clientVariables,
  serverVariables,
  type ClientEnv,
  type ServerEnv,
} from "./variables";
import type { SharedEnv } from "../shared";

type Env = ServerEnv & ClientEnv & SharedEnv;
type RuntimeEnv = Record<keyof ClientEnv, string | undefined>;

const runtimeEnv = Object.keys(clientVariables).reduce<RuntimeEnv>(
  (record, key) => {
    const currentKey = key as keyof ClientEnv;
    record[currentKey] = process.env[currentKey] ?? undefined;
    return record;
  },
  {} as RuntimeEnv,
);

const webEnv = createEnv({
  server: { ...sharedEnvSchema, ...serverVariables },
  client: clientVariables,
  experimental__runtimeEnv: runtimeEnv,
  extends: [sharedEnv],
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
  onValidationError: (issues) => {
    throw new Error(`Invalid environment variables: ${JSON.stringify(issues)}`);
  },
});

export const env: Env = webEnv as Env;
