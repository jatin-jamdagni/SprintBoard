import { config } from "@repo/config";
import { createGitHubClient, fetchPullRequests, fetchSinglePR } from "@repo/github";
import { upsertPR, getWorkspaceById, getAllWorkspaces } from "@repo/db";

function buildGitHubClient(workspaceToken?: string | null) {
  const token = workspaceToken?.trim() || config.GITHUB_TOKEN;
  return createGitHubClient({ token });
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
};

export type SyncWorkspaceFailure = {
  workspaceId: number;
  reason: string;
  status: number | null;
};

export type SyncAllWorkspacesResult = {
  succeeded: SyncWorkspaceResult[];
  failed: SyncWorkspaceFailure[];
};

function parseError(error: unknown): { message: string; status: number | null } {
  const message = error instanceof Error ? error.message : String(error);
  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
      ? (error as { status: number }).status
      : null;
  return { message, status };
}

export async function syncWorkspace(workspaceId: number): Promise<SyncWorkspaceResult> {
  const workspace = await getWorkspaceById(workspaceId);
  if (!workspace) throw new Error(`Workspace ${workspaceId} not found`);

  const { owner, repo } = splitRepo(workspace);
  const client = buildGitHubClient(workspace.githubToken);

  console.log(`[sync] workspace=${workspaceId} repo=${owner}/${repo}`);

  const result = await fetchPullRequests({
    client,
    owner,
    repo,
    workspaceId,
    state: "all",
    perPage: 50,
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

  console.log(`[sync] upserted=${upserted.length} rateLimitRemaining=${result.rateLimitRemaining}`);

  return {
    workspaceId,
    synced: upserted.length,
    rateLimitRemaining: result.rateLimitRemaining,
    fetchedAt: result.fetchedAt,
  };
}

export async function syncAllWorkspaces(): Promise<SyncAllWorkspacesResult> {
  const workspaces = await getAllWorkspaces();
  console.log(`[cron] syncing ${workspaces.length} workspace(s)`);

  const results = await Promise.allSettled(
    workspaces.map((ws) => syncWorkspace(ws.id))
  );
  const succeeded: SyncWorkspaceResult[] = [];
  const failed: SyncWorkspaceFailure[] = [];

  results.forEach((result, index) => {
    const workspaceId = workspaces[index]?.id ?? -1;

    if (result.status === "fulfilled") {
      succeeded.push(result.value);
      return;
    }

    const { message, status } = parseError(result.reason);
    failed.push({
      workspaceId,
      reason: message,
      status,
    });

    const suffix =
      status === 404
        ? " (check repo path and token access for this workspace)"
        : "";
    console.warn(`[cron] workspace=${workspaceId} failed: ${message}${suffix}`);
  });

  return { succeeded, failed };
}

export async function syncSinglePR(
  workspaceId: number,
  prNumber: number
): Promise<void> {
  const workspace = await getWorkspaceById(workspaceId);
  if (!workspace) throw new Error(`Workspace ${workspaceId} not found`);

  const { owner, repo } = splitRepo(workspace);
  const client = buildGitHubClient(workspace.githubToken);

  const pr = await fetchSinglePR({ client, owner, repo, prNumber, workspaceId });
  if (!pr) {
    console.warn(`[sync] PR #${prNumber} not found in ${owner}/${repo}`);
    return;
  }

  await upsertPR({
    ...pr,
    openedAt: new Date(pr.openedAt),
    mergedAt: pr.mergedAt ? new Date(pr.mergedAt) : null,
    firstReviewAt: pr.firstReviewAt ? new Date(pr.firstReviewAt) : null,
  });

  console.log(`[sync] upserted PR #${prNumber} for workspace=${workspaceId}`);
}
