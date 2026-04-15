import { getAllWorkspaces } from "@repo/db";
import { syncSinglePR } from "./sync.service";
import type { GitHubPRPayload, GitHubReviewPayload } from "../lib/webhook-types";

const SYNC_ACTIONS = new Set([
  "opened",
  "closed",
  "reopened",
  "synchronize",
  "ready_for_review",
  "converted_to_draft",
]);

async function findWorkspaceByRepo(fullName: string): Promise<number | null> {
  const workspaces = await getAllWorkspaces();
  const match = workspaces.find(
    (ws) =>
      ws.githubRepo === fullName ||
      ws.githubRepo === fullName.split("/")[1] ||
      `${ws.githubOrg}/${ws.githubRepo}` === fullName
  );
  return match?.id ?? null;
}

export async function handlePREvent(payload: GitHubPRPayload): Promise<void> {
  const { action, number: prNumber, repository } = payload;

  if (!SYNC_ACTIONS.has(action)) {
    console.log(`[webhook] skipping PR action="${action}" pr=#${prNumber}`);
    return;
  }

  console.log(`[webhook] PR action="${action}" pr=#${prNumber} repo=${repository.full_name}`);

  const workspaceId = await findWorkspaceByRepo(repository.full_name);
  if (!workspaceId) {
    console.warn(`[webhook] no workspace found for repo=${repository.full_name}`);
    return;
  }

  await syncSinglePR(workspaceId, prNumber);
}

export async function handleReviewEvent(payload: GitHubReviewPayload): Promise<void> {
  const { pull_request, repository } = payload;

  console.log(`[webhook] review submitted pr=#${pull_request.number} repo=${repository.full_name}`);

  const workspaceId = await findWorkspaceByRepo(repository.full_name);
  if (!workspaceId) {
    console.warn(`[webhook] no workspace found for repo=${repository.full_name}`);
    return;
  }

  await syncSinglePR(workspaceId, pull_request.number);
}