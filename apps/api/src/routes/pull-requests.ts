import { Elysia } from "elysia";
import { getPRsByWorkspace, getOpenPRsByWorkspace, getSnapshotsByWorkspace, getPRByNumber } from "@repo/db";
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

    .get("/prs/:prNumber", async ({ params, auth, set }) => {
        requireAuth(auth);
        const workspaceId = Number(params.workspaceId);
        if (workspaceId !== auth.user.workspaceId) {
            set.status = 403;
            return { success: false, error: "Forbidden" };
        }
        const pr = await getPRByNumber(workspaceId, Number(params.prNumber));
        if (!pr) {
            set.status = 404;
            return { success: false, error: "PR not found" };
        }
        return { success: true, data: pr };
    })