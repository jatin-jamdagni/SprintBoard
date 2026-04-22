import { getAllWorkspaces } from "@repo/db";
import { logger } from "@repo/logger";
import { syncSinglePR } from "./sync.service";
import type { GitHubPRPayload, GitHubReviewPayload } from "../lib/webhook-types";

const log = logger.child({ module: "webhook" });

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
  log.info({ action, prNumber, repo: repository.full_name }, "PR event");

  if (!SYNC_ACTIONS.has(action)) {
    return;
  }

  const workspaceId = await findWorkspaceByRepo(repository.full_name);
  if (!workspaceId) {
    log.warn({ repo: repository.full_name }, "no workspace for repo");
    return;
  }

  await syncSinglePR(workspaceId, prNumber);
}

export async function handleReviewEvent(payload: GitHubReviewPayload): Promise<void> {
  const { action, pull_request, repository } = payload;
  log.info({ action, prNumber: pull_request.number }, "review event");

  const workspaceId = await findWorkspaceByRepo(repository.full_name);
  if (!workspaceId) {
    log.warn({ repo: repository.full_name }, "no workspace for repo");
    return;
  }

  await syncSinglePR(workspaceId, pull_request.number);
}
