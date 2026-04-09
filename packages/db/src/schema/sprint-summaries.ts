import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces";

export const sprintSummaries = pgTable("sprint_summaries", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  prCount: integer("pr_count").notNull().default(0),
  mergedCount: integer("merged_count").notNull().default(0),
  generatedAt: timestamp("generated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type SprintSummaryRow = typeof sprintSummaries.$inferSelect;
export type InsertSprintSummaryRow = typeof sprintSummaries.$inferInsert;