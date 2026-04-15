import { Elysia } from "elysia";
import { getPRsByWorkspace, getOpenPRsByWorkspace, getSnapshotsByWorkspace } from "@repo/db";

export const prRoutes = new Elysia({ prefix: "/api/workspaces/:workspaceId" })
    .get("/prs", async ({ params }) => {
        const data = await getPRsByWorkspace(Number(params.workspaceId));
        return { success: true, data };
    })
    .get("/prs/open", async ({ params }) => {
        const data = await getOpenPRsByWorkspace(Number(params.workspaceId));
        return { success: true, data };
    })
    .get("/snapshots", async ({ params }) => {

        const data = await getSnapshotsByWorkspace(Number(params.workspaceId));

        return { success: true, data }
    })