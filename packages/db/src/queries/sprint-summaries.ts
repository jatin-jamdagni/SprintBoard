import { eq, desc } from "drizzle-orm";
import { db } from "../client";
import { sprintSummaries } from "../schema";
import type { InsertSprintSummaryRow } from "../schema";

export async function getLatestSummary(workspaceId: number) {
  const result = await db
    .select()
    .from(sprintSummaries)
    .where(eq(sprintSummaries.workspaceId, workspaceId))
    .orderBy(desc(sprintSummaries.generatedAt))
    .limit(1);
  return result[0] ?? null;
}

export async function getAllSummaries(workspaceId: number) {
  return db
    .select()
    .from(sprintSummaries)
    .where(eq(sprintSummaries.workspaceId, workspaceId))
    .orderBy(desc(sprintSummaries.generatedAt));
}

export async function createSummary(data: InsertSprintSummaryRow) {
  const result = await db
    .insert(sprintSummaries)
    .values(data)
    .returning();
  return result[0]!;
}