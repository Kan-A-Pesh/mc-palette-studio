import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { ulid } from "ulid";

export const documents = pgTable("documents", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => ulid()),
  content: text("content").notNull().default(""),
  yjsState: text("yjs_state"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
