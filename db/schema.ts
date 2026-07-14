import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const records = sqliteTable("records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  kind: text("kind", { enum: ["workout", "weight", "meal"] }).notNull(),
  date: text("date").notNull(),
  title: text("title").notNull(),
  detail: text("detail").notNull().default(""),
  value: real("value"),
  createdAt: integer("created_at").notNull(),
});
