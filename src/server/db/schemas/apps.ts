import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  integer,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { files } from "./files";
import { storageConfiguration } from "./storageConfiguration";
import { apiKeys } from "./apiKeys";

export const apps = pgTable("apps", {
  id: uuid("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 500 }),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  userId: text("user_id").notNull(),
  storageId: integer("storage_id"),
});

export const appsRelations = relations(apps, ({ one, many }) => ({
  user: one(users, { fields: [apps.userId], references: [users.id] }),
  files: many(files),
  storage: one(storageConfiguration, {
    fields: [apps.storageId],
    references: [storageConfiguration.id],
  }),
  apiKeys: many(apiKeys),
}));
