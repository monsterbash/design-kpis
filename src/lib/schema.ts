import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("Product Designer"),
  status: text("status", { enum: ["active", "archived"] })
    .notNull()
    .default("active"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const metrics = sqliteTable("metrics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  shortDescription: text("short_description").notNull(),
  fullDescription: text("full_description").notNull(),
  ownerId: integer("owner_id")
    .notNull()
    .references(() => users.id),
  status: text("status", { enum: ["active", "archived"] })
    .notNull()
    .default("active"),
  cadence: text("cadence").notNull(),
  target: text("target").notNull(),
  fieldDefinitions: text("field_definitions", { mode: "json" })
    .notNull()
    .$type<FieldDefinition[]>(),
  displayType: text("display_type", {
    enum: ["average", "percentage", "computed_average"],
  }).notNull(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const entries = sqliteTable("entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  metricId: integer("metric_id")
    .notNull()
    .references(() => metrics.id),
  submittedBy: integer("submitted_by")
    .notNull()
    .references(() => users.id),
  description: text("description").notNull(),
  ratings: text("ratings", { mode: "json" }).notNull().$type<Record<string, number | boolean | string>>(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export type FieldDefinition = {
  name: string;
  type: "decimal" | "integer" | "radio";
  min?: number;
  max?: number;
  options?: string[];
};

export type User = typeof users.$inferSelect;
export type Metric = typeof metrics.$inferSelect;
export type Entry = typeof entries.$inferSelect;
