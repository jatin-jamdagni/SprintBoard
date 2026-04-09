import {
  pgTable,
  serial,
  integer,
  text,
  boolean,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces";

export const pullRequests = pgTable(
  "pull_requests",
  {
    id: serial("id").primaryKey(),
    workspaceId: integer("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    repo: text("repo").notNull(),
    prNumber: integer("pr_number").notNull(),
    title: text("title").notNull(),
    author: text("author").notNull(),
    avatarUrl: text("avatar_url"),
    status: text("status", {
      enum: ["open", "merged", "closed", "draft"],
    }).notNull(),
    isDraft: boolean("is_draft").notNull().default(false),
    openedAt: timestamp("opened_at", { withTimezone: true }).notNull(),
    mergedAt: timestamp("merged_at", { withTimezone: true }),
    firstReviewAt: timestamp("first_review_at", { withTimezone: true }),
    reviewCount: integer("review_count").notNull().default(0),
    additions: integer("additions").notNull().default(0),
    deletions: integer("deletions").notNull().default(0),
    url: text("url").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("pr_workspace_repo_number_idx").on(
      table.workspaceId,
      table.repo,
      table.prNumber
    ),
  ]
);

export type PullRequestRow = typeof pullRequests.$inferSelect;
export type InsertPullRequestRow = typeof pullRequests.$inferInsert;