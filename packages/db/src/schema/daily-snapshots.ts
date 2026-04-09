import {
  pgTable,
  serial,
  integer,
  date,
  numeric,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces";

export const dailySnapshots = pgTable(
  "daily_snapshots",
  {
    id: serial("id").primaryKey(),
    workspaceId: integer("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    prsOpened: integer("prs_opened").notNull().default(0),
    prsMerged: integer("prs_merged").notNull().default(0),
    avgReviewLagHours: numeric("avg_review_lag_hours", {
      precision: 6,
      scale: 2,
    }),
  },
  (table) => [
    uniqueIndex("snapshot_workspace_date_idx").on(
      table.workspaceId,
      table.date
    ),
  ]
);

export type DailySnapshotRow = typeof dailySnapshots.$inferSelect;
export type InsertDailySnapshotRow = typeof dailySnapshots.$inferInsert;