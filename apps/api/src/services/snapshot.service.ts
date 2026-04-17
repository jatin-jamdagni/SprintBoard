import { computeSnapshotForDate, getAllWorkspaces, upsertSnapshot } from "@repo/db";




export async function computeSnapshotsForWorkspace(
    workspaceId: number,
    daysBack = 7
): Promise<number> {

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

    console.log(`[snapshots] workspace=${workspaceId} computed=${computed} days`);

    return computed;
}


export async function computeSnapshotsForAllWorkspaces(): Promise<void> {
    const workspaces = await getAllWorkspaces();
    console.log(`[snapshots] computing for ${workspaces.length} workspace(s)`);

    await Promise.allSettled(
        workspaces.map((ws) => computeSnapshotsForWorkspace(ws.id, 7))
    )

    console.log("[snapshots] all done")
}