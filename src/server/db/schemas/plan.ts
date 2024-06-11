import { relations } from "drizzle-orm";
import { pgTable, serial, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./auth";

export const plan = pgTable("plan", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").unique().notNull(),
  plan: varchar("plan", {
    enum: ["free", "premium"],
  })
    .default("free")
    .notNull(),
});

export const planRelations = relations(plan, ({ one }) => ({
  user: one(users, {
    fields: [plan.userId],
    references: [users.id],
  }),
}));
