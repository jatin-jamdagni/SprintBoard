import { Elysia } from "elysia";
import { createGitHubClient, fetchRateLimit } from "@repo/github";
import { config } from "@repo/config";
import { syncWorkspace } from "../services/sync.service";

export const syncRoutes = new Elysia({ prefix: "/api/sync" })
  .post("/workspace/:workspaceId", async ({ params, set }) => {
    try {
      const result = await syncWorkspace(Number(params.workspaceId));
      return { success: true, data: result };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sync failed";
      const lowerMessage = message.toLowerCase();

      set.status = lowerMessage.includes("not found") ? 404 : 500;
      return  {
        success: false,
        error: message,
      }
    }
  })
  .get("/rate-limit", async () => {
    const client = createGitHubClient({ token: config.GITHUB_TOKEN });
    const data = await fetchRateLimit(client);
    return { success: true, data };
  });
