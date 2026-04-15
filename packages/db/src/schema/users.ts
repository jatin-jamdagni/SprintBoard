import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces";

export const users = pgTable("users", {
  id:            serial("id").primaryKey(),
  workspaceId:   integer("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  githubId:      text("github_id").notNull().unique(),
  githubLogin:   text("github_login").notNull(),
  name:          text("name"),
  avatarUrl:     text("avatar_url"),
  email:         text("email"),
  accessToken:   text("access_token").notNull(),
  role:          text("role", { enum: ["owner", "member"] })
    .notNull()
    .default("member"),
  createdAt:     timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastLoginAt:   timestamp("last_login_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sessions = pgTable("sessions", {
  id:          text("id").primaryKey(),
  userId:      integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  workspaceId: integer("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  expiresAt:   timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt:   timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  isValid:     boolean("is_valid").notNull().default(true),
});

export type UserRow     = typeof users.$inferSelect;
export type InsertUserRow = typeof users.$inferInsert;
export type SessionRow  = typeof sessions.$inferSelect;
export type InsertSessionRow = typeof sessions.$inferInsert;