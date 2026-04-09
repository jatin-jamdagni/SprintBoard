import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  githubOrg: text("github_org").notNull(),
  githubRepo: text("github_repo").notNull(),
  githubToken: text("github_token"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type WorkspaceRow = typeof workspaces.$inferSelect;
export type InsertWorkspaceRow = typeof workspaces.$inferInsert;