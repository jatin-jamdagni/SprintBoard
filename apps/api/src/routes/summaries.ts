import {
  createSummary,
  getAllSummaries,
  getLatestSummary,
  getPRsByWorkspace,
  getWorkspaceById,
} from "@repo/db";
import Elysia from "elysia";
import { generateStandupSummary } from "@repo/ai";
import { wsBroker } from "../lib/ws-broker";

export const summaryRoutes = new Elysia({
  prefix: "/api/workspaces/:workspaceId/summaries",
})
  .get("/", async ({ params, set }) => {
    const workspaceId = Number(params.workspaceId);

    if (!Number.isFinite(workspaceId) || workspaceId <= 0) {
      set.status = 400;
      return { success: false, error: "Invalid workspace id" };
    }

    const data = await getAllSummaries(workspaceId);

    return { success: true, data };
  })
  .get("/latest", async ({ params, set }) => {
    const workspaceId = Number(params.workspaceId);

    if (!Number.isFinite(workspaceId) || workspaceId <= 0) {
      set.status = 400;
      return { success: false, error: "Invalid workspace id" };
    }

    const summary = await getLatestSummary(workspaceId);

    if (!summary) {
      set.status = 404;
      return { success: false, error: "No summaries yet. Generate one first." };
    }

    return { success: true, data: summary };
  })
  .post("/generate", async ({ params, set }) => {
    const workspaceId = Number(params.workspaceId);

    if (!Number.isFinite(workspaceId) || workspaceId <= 0) {
      set.status = 400;
      return { success: false, error: "Invalid workspace id" };
    }

    const workspace = await getWorkspaceById(workspaceId);
    if (!workspace) {
      set.status = 404;
      return {
        success: false,
        error: "Workspace not found",
      };
    }

    const prs = await getPRsByWorkspace(workspaceId);

    if (prs.length === 0) {
      set.status = 400;
      return {
        success: false,
        error: "No PRs found. Sync first.",
      };
    }

    console.log(
      `[ai] Generating standup summary for ${workspace.githubOrg}/${workspace.githubRepo}...`,
    );

    const result = await generateStandupSummary(
      prs,
      workspace.githubOrg,
      workspace.githubRepo,
    );

    const saved = await createSummary({
      workspaceId,
      content: result.content,
      prCount: result.prCount,
      mergedCount: result.mergedCount,
    });

    wsBroker.broadcast(workspaceId, {
      type: "summary.generated",
      workspaceId,
      summaryId: saved.id, 
    })

    console.log(
      `[ai] Summary generated. Tokens: ${result.inputTokens} in / ${result.outputTokens} out`,
    );

    return {
      success: true,
      data: saved,
    };
  });
