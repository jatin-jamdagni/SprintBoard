import { Elysia } from "elysia";
import { getAllWorkspaces, createWorkspace, getWorkspaceById } from "@repo/db";
import { CreateWorkspaceSchema } from "@repo/types";
import { authPlugin, requireAuth } from "../plugins/auth.plugin";

export const workspaceRoutes = new Elysia({ prefix: "/api/workspaces" })
    .use(authPlugin)

    .get("/", async ({ auth }) => {
        requireAuth(auth);
        const data = await getAllWorkspaces();
        const scoped = data.filter((ws) => ws.id === auth.user.workspaceId);
        return { success: true, data: scoped };
    })
    .get("/:workspaceId", async ({ auth, params, set }) => {
        requireAuth(auth);
        const workspace = await getWorkspaceById(Number(params.workspaceId));
        if (!workspace) {
            set.status = 404;

            return {
                success: false,
                error: "Not found"
            }
        }
        return { success: true, data: workspace };
    })
    .post("/", async ({ auth, body, set }) => {
        requireAuth(auth);

        const parsed = CreateWorkspaceSchema.safeParse(body);
        if (!parsed.success) {

            set.status = 400;

            return {
                success: false,
                error: parsed.error.message
            }

        }
        const workspace = await createWorkspace(parsed.data);
        return { success: true, data: workspace };
    });