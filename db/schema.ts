import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
export const sources = sqliteTable("sources", {
  id: text("id").primaryKey(),
  payload: text("payload").notNull(),
});
export const evidence = sqliteTable("evidence", {
  id: text("id").primaryKey(),
  sourceId: text("source_id").notNull(),
  payload: text("payload").notNull(),
});
export const threats = sqliteTable("threat_techniques", {
  id: text("id").primaryKey(),
  payload: text("payload").notNull(),
});
export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  county: text("county").notNull(),
  payload: text("payload").notNull(),
});
export const claims = sqliteTable("claims", {
  id: text("id").primaryKey(),
  text: text("text").notNull(),
  status: text("status").notNull(),
  expiresAt: integer("expires_at").notNull(),
});
export const investigations = sqliteTable(
  "investigations",
  {
    id: text("id").primaryKey(),
    owner: text("owner").notNull(),
    payload: text("payload").notNull(),
    createdAt: integer("created_at").notNull(),
    expiresAt: integer("expires_at").notNull(),
  },
  (t) => [index("idx_investigations_expiry").on(t.expiresAt)],
);
export const rateLimits = sqliteTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  expiresAt: integer("expires_at").notNull(),
});
export const catalogueMeta = sqliteTable("catalogue_meta", {
  id: text("id").primaryKey(),
  version: text("version").notNull(),
});
