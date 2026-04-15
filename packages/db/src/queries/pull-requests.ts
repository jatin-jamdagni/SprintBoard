import { eq, desc, and, gte, lte } from "drizzle-orm";
import { db } from "../client";
import { pullRequests } from "../schema";
import type { InsertPullRequestRow } from "../schema";

export async function getPRsByWorkspace(workspaceId: number) {
  return db
    .select()
    .from(pullRequests)
    .where(eq(pullRequests.workspaceId, workspaceId))
    .orderBy(desc(pullRequests.openedAt));
}

export async function getOpenPRsByWorkspace(workspaceId: number) {
  return db
    .select()
    .from(pullRequests)
    .where(
      and(
        eq(pullRequests.workspaceId, workspaceId),
        eq(pullRequests.status, "open")
      )
    )
    .orderBy(desc(pullRequests.openedAt));
}

export async function getPRsByDateRange(
  workspaceId: number,
  from: Date,
  to: Date
) {
  return db
    .select()
    .from(pullRequests)
    .where(
      and(
        eq(pullRequests.workspaceId, workspaceId),
        gte(pullRequests.openedAt, from),
        lte(pullRequests.openedAt, to)
      )
    )
    .orderBy(desc(pullRequests.openedAt));
}

export async function upsertPR(data: InsertPullRequestRow) {
  const result = await db
    .insert(pullRequests)
    .values(data)
    .onConflictDoUpdate({
      target: [
        pullRequests.workspaceId,
        pullRequests.repo,
        pullRequests.prNumber,
      ],
      set: {
        title:         data.title,
        status:        data.status,
        isDraft:       data.isDraft,
        mergedAt:      data.mergedAt,
        firstReviewAt: data.firstReviewAt,
        reviewCount:   data.reviewCount,
        additions:     data.additions,
        deletions:     data.deletions,
        updatedAt:     new Date(),
      },
    })
    .returning();
  return result[0]!;
}