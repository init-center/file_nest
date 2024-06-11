import { relations } from "drizzle-orm";
import { pgTable, serial, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { apps } from "./apps";

export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  key: uuid("key").notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  clientId: uuid("client_id").notNull().unique(),
  appId: uuid("app_id").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
});

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  app: one(apps, {
    fields: [apiKeys.appId],
    references: [apps.id],
  }),
}));
