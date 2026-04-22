import { computeSnapshotForDate, getAllWorkspaces, upsertSnapshot } from "@repo/db";
import { logger } from "@repo/logger";

const log = logger.child({ module: "snapshots" });

export async function computeSnapshotsForWorkspace(
    workspaceId: number,
    daysBack = 7
): Promise<number> {
    log.info({ workspaceId, days: daysBack }, "computing snapshots");

    const dates: string[] = [];

    for (let i = 0; i < daysBack; i++) {

        const d = new Date();
        d.setUTCDate(d.getUTCDate() - i);

        dates.push(d.toISOString().split("T")[0]!);
    }

    let computed = 0;

    for (const date of dates) {
        const snapshot = await computeSnapshotForDate(workspaceId, date);

        await upsertSnapshot(snapshot);
        computed++;
    }

    log.info({ workspaceId, computed }, "snapshots done");

    return computed;
}


export async function computeSnapshotsForAllWorkspaces(): Promise<void> {
    const workspaces = await getAllWorkspaces();
    log.info({ workspaces: workspaces.length }, "computing snapshots for all workspaces");

    await Promise.allSettled(
        workspaces.map((ws) => computeSnapshotsForWorkspace(ws.id, 7))
    )

    log.info("all snapshots done");
}
