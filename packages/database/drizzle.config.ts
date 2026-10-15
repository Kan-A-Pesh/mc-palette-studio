import type { Config } from "drizzle-kit";

import "@repo/env/load-env";
import { env } from "@repo/env/apps-web";

export default {
  schema: "./schema/index.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
} satisfies Config;
