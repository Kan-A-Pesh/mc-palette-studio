import "@repo/env/load-env";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./index";

migrate(db, { migrationsFolder: "migrations" })
  .then(() => {
    console.log("migrations finished!");
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
