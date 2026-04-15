import { eq } from "drizzle-orm";
import { db } from "../client";
import { users, sessions } from "../schema";
import type { InsertUserRow, InsertSessionRow } from "../schema";

export async function getUserByGithubId(githubId: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.githubId, githubId))
    .limit(1);
  return result[0] ?? null;
}

export async function getUserById(id: number) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function upsertUser(data: InsertUserRow) {
  const result = await db
    .insert(users)
    .values(data)
    .onConflictDoUpdate({
      target: users.githubId,
      set: {
        githubLogin:  data.githubLogin,
        name:         data.name,
        avatarUrl:    data.avatarUrl,
        email:        data.email,
        accessToken:  data.accessToken,
        lastLoginAt:  new Date(),
      },
    })
    .returning();
  return result[0]!;
}

export async function createSession(data: InsertSessionRow) {
  const result = await db
    .insert(sessions)
    .values(data)
    .returning();
  return result[0]!;
}

export async function getSession(sessionId: string) {
  const result = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);
  const session = result[0];
  if (!session) return null;
  if (!session.isValid) return null;
  if (session.expiresAt < new Date()) return null;
  return session;
}

export async function invalidateSession(sessionId: string) {
  await db
    .update(sessions)
    .set({ isValid: false })
    .where(eq(sessions.id, sessionId));
}

export async function invalidateAllUserSessions(userId: number) {
  await db
    .update(sessions)
    .set({ isValid: false })
    .where(eq(sessions.userId, userId));
}