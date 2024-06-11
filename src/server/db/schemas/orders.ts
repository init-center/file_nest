import { relations } from "drizzle-orm";
import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./auth";

export const orders = pgTable("orders", {
  sessionId: varchar("sessionId", { length: 255 }).primaryKey(),
  status: varchar("status", {
    enum: ["created", "canceled", "completed"],
  }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  userId: varchar("id").notNull(),
});

export const ordersRelation = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}));
