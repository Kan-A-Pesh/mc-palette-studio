import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sharedEnv } from "@repo/env/shared";

import * as schema from "./schema";

const pool = new Pool({
  connectionString: sharedEnv.DATABASE_URL,
});

export const db = drizzle({ client: pool, schema });

export type Database = typeof db;
