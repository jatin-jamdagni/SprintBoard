import { eq, desc, sql, and, gte, lte } from "drizzle-orm";

import { dailySnapshots, pullRequests } from "../schema";
import type { InsertDailySnapshotRow } from "../schema";
import { db } from "../index";

export async function getSnapshotsByWorkspace(workspaceId: number, limit = 30) {
    return db
        .select()
        .from(dailySnapshots)
        .where(eq(dailySnapshots.workspaceId, workspaceId))
        .orderBy(desc(dailySnapshots.date))
        .limit(limit);
}

export async function upsertSnapshot(data: InsertDailySnapshotRow) {
    const result = await db
        .insert(dailySnapshots)
        .values(data)
        .onConflictDoUpdate({
            target: [dailySnapshots.workspaceId, dailySnapshots.date],
            set: {
                prsOpened: data.prsOpened,
                prsMerged: data.prsMerged,
                avgReviewLagHours: data.avgReviewLagHours,
            },
        })
        .returning();
    return result[0]!;
}


export async function computeSnapshotForDate(
    workspaceId: number,
    date: string
): Promise<InsertDailySnapshotRow> {
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);

    const [opened, merged, lagRows] = await Promise.all([
        // PRs opened on this date
        db
            .select({ count: sql<number>`count(*)::int` })
            .from(pullRequests)
            .where(
                and(
                    eq(pullRequests.workspaceId, workspaceId),
                    gte(pullRequests.openedAt, dayStart),
                    lte(pullRequests.openedAt, dayEnd)
                )
            ),

        // PRs merged on this date
        db
            .select({ count: sql<number>`count(*)::int` })
            .from(pullRequests)
            .where(
                and(
                    eq(pullRequests.workspaceId, workspaceId),
                    gte(pullRequests.mergedAt, dayStart),
                    lte(pullRequests.mergedAt, dayEnd)
                )
            ),

        // avg review lag for PRs that got their first review on this date
        db
            .select({
                avg: sql<string>`avg(
          extract(epoch from (first_review_at - opened_at)) / 3600
        )::numeric(8,2)`,
            })
            .from(pullRequests)
            .where(
                and(
                    eq(pullRequests.workspaceId, workspaceId),
                    gte(pullRequests.firstReviewAt, dayStart),
                    lte(pullRequests.firstReviewAt, dayEnd)
                )
            ),
    ]);

    return {
        workspaceId,
        date,
        prsOpened: opened[0]?.count ?? 0,
        prsMerged: merged[0]?.count ?? 0,
        avgReviewLagHours: lagRows[0]?.avg ?? null,
    };
}