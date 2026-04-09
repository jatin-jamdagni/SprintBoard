import { eq, desc } from "drizzle-orm";

import { dailySnapshots } from "../schema";
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