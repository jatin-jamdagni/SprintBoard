import { Elysia } from "elysia";
import { createGitHubClient, fetchRateLimit } from "@repo/github";
import { getRateLimitState } from "@repo/cache";
import { config } from "@repo/config";
import { syncWorkspace } from "../services/sync.service";
import { authPlugin, requireAuth } from "../plugins/auth.plugin";
import { computeSnapshotsForWorkspace } from "../services/snapshot.service";

export const syncRoutes = new Elysia({ prefix: "/api/sync" })
  .use(authPlugin)
  .post("/workspace/:workspaceId", async ({ auth, params, set }) => {
    requireAuth(auth);

    try {
      const result = await syncWorkspace(Number(params.workspaceId));
      return { success: true, data: result };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sync failed";
      set.status = message.includes("not found") ? 404 : 500;

      return {
        success: false,
        error: message,
      }
    }
  })
  .get("/rate-limit", async ({ auth }) => {
    requireAuth(auth);

    const cached = await getRateLimitState();
    if (cached) return { success: true, data: cached };

    const client = createGitHubClient({ token: config.GITHUB_TOKEN });
    const data = await fetchRateLimit(client);
    return { success: true, data };
  })

  .post("/workspace/:workspaceId/snapshots", async ({ params, auth, set }) => {



    requireAuth(auth);

    const id = Number(params.workspaceId);

    if (id !== auth.user.workspaceId) {
      set.status = 403
      return { success: false, error: "Forbidden" }
    }

    const computed = await computeSnapshotsForWorkspace(id, 30);

    return {
      success: true,
      data: {
        computed
      }
    }
  })