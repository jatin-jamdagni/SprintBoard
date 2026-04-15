import { Elysia } from "elysia";
import { getPRsByWorkspace, getOpenPRsByWorkspace, getSnapshotsByWorkspace } from "@repo/db";
import { authPlugin, requireAuth } from "../plugins/auth.plugin";

export const prRoutes = new Elysia({ prefix: "/api/workspaces/:workspaceId" })
    .use(authPlugin)

    .get("/prs", async ({ auth, params }) => {
        requireAuth(auth);

        const data = await getPRsByWorkspace(Number(params.workspaceId));
        return { success: true, data };
    })
    .get("/prs/open", async ({ auth, params }) => {
        requireAuth(auth);

        const data = await getOpenPRsByWorkspace(Number(params.workspaceId));
        return { success: true, data };
    })
    .get("/snapshots", async ({ auth, params }) => {
        requireAuth(auth);

        const data = await getSnapshotsByWorkspace(Number(params.workspaceId));

        return { success: true, data }
    })