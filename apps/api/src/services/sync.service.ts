import { config } from "@repo/config";
import { createGitHubClient, fetchPullRequests, fetchSinglePR } from "@repo/github";
import { upsertPR, getWorkspaceById, getAllWorkspaces } from "@repo/db";
import { wsBroker } from "../lib/ws-broker";
import {
  cacheInvalidatePattern,
  cacheDel,
  CacheKeys,
} from "@repo/cache";
import { computeSnapshotsForWorkspace } from "./snapshot.service";

function buildGitHubClient() {
  return createGitHubClient({ token: config.GITHUB_TOKEN });
}

function splitRepo(workspace: { githubOrg: string; githubRepo: string }) {
  const { githubOrg, githubRepo } = workspace;
  if (githubRepo.includes("/")) {
    const [owner, repo] = githubRepo.split("/");
    return { owner: owner!, repo: repo! };
  }
  return { owner: githubOrg, repo: githubRepo };
}

export type SyncWorkspaceResult = {
  workspaceId: number;
  synced: number;
  rateLimitRemaining: number | null;
  fetchedAt: string;
  fromCache: boolean;
};

export async function syncWorkspace(workspaceId: number): Promise<SyncWorkspaceResult> {
  const workspace = await getWorkspaceById(workspaceId);
  if (!workspace) throw new Error(`Workspace ${workspaceId} not found`);

  const { owner, repo } = splitRepo(workspace);
  const client = buildGitHubClient();

  console.log(`[sync] workspace=${workspaceId} repo=${owner}/${repo}`);

  const result = await fetchPullRequests({
    client,
    owner,
    repo,
    workspaceId,
    state: "all",
    perPage: 50,
    bypassCache: true,
  });

  const upserted = await Promise.all(
    result.prs.map((pr) =>
      upsertPR({
        ...pr,
        openedAt: new Date(pr.openedAt),
        mergedAt: pr.mergedAt ? new Date(pr.mergedAt) : null,
        firstReviewAt: pr.firstReviewAt ? new Date(pr.firstReviewAt) : null,
      })
    )
  );

  await cacheInvalidatePattern(`db:prs:workspace:${workspaceId}*`);
  await cacheInvalidatePattern(`db:snapshots:workspace:${workspaceId}*`);

  await computeSnapshotsForWorkspace(workspaceId, 7).catch((err) =>
    console.log("[sync] snapshot computation failed", err)
  )

  wsBroker.broadcast(workspaceId, {
    type: "pr.synced",
    workspaceId,
    synced: upserted.length,
  });

  console.log(`[sync] upserted=${upserted.length} fromCache=${result.fromCache} rateLimitRemaining=${result.rateLimitRemaining}`);

  return {
    workspaceId,
    synced: upserted.length,
    rateLimitRemaining: result.rateLimitRemaining,
    fetchedAt: result.fetchedAt,
    fromCache: result.fromCache,
  };
}

export async function syncAllWorkspaces(): Promise<SyncWorkspaceResult[]> {
  const workspaces = await getAllWorkspaces();
  console.log(`[cron] syncing ${workspaces.length} workspace(s)`);

  const results = await Promise.allSettled(
    workspaces.map((ws) => syncWorkspace(ws.id))
  );

  return results
    .filter((r): r is PromiseFulfilledResult<SyncWorkspaceResult> => r.status === "fulfilled")
    .map((r) => r.value);
}

export async function syncSinglePR(
  workspaceId: number,
  prNumber: number
): Promise<void> {
  const workspace = await getWorkspaceById(workspaceId);
  if (!workspace) throw new Error(`Workspace ${workspaceId} not found`);

  const { owner, repo } = splitRepo(workspace);
  const client = buildGitHubClient();

  const pr = await fetchSinglePR({ client, owner, repo, prNumber, workspaceId });
  if (!pr) {
    console.warn(`[sync] PR #${prNumber} not found in ${owner}/${repo}`);
    return;
  }

  const saved = await upsertPR({
    ...pr,
    openedAt: new Date(pr.openedAt),
    mergedAt: pr.mergedAt ? new Date(pr.mergedAt) : null,
    firstReviewAt: pr.firstReviewAt ? new Date(pr.firstReviewAt) : null,
  });

  await cacheDel(CacheKeys.workspacePRs(workspaceId));

  wsBroker.broadcast(workspaceId, {
    type: "pr.upserted",
    workspaceId,
    prNumber: saved.prNumber,
    repo: saved.repo,
  });

  console.log(`[sync] upserted PR #${prNumber} workspace=${workspaceId}`);
}