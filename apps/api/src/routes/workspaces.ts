import { createWorkspace, getAllWorkspaces, getWorkspaceById } from "@repo/db";
import { CreateWorkspaceSchema } from "@repo/types";
import Elysia from "elysia";




export const workspaceRoutes = new Elysia({
    prefix: "/api/workspaces"
})

    .get("/", async () => {
        const data = await getAllWorkspaces();
        return { sucess: true, data }
    })

    .get("/:id", async ({ params, set }) => {
        const workspace = await getWorkspaceById(Number(params.id));

        if (!workspace) {
            set.status = 404;
            return { success: false, error: "Not found" };
        }

        return { success: true, data: workspace };
    })

    .post("/", async ({ body, set})=>{

        const parsed = CreateWorkspaceSchema.safeParse(body);

        if(!parsed.success){
            set.status = 400;
            return { success: false, error: parsed.error.message}
        }

        const workspace = await createWorkspace(parsed.data);
        return {success: true, data: workspace}
    })