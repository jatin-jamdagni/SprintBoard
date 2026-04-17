
import { apiFetch } from "./http";
import type { PullRequestRow } from "@repo/types";

export const pullRequestsApi = {
    getAll: (workspaceId: number) =>
        apiFetch<PullRequestRow[]>(`/api/workspaces/${workspaceId}/prs`),

    getOpen: (workspaceId: number) =>
        apiFetch<PullRequestRow[]>(`/api/workspaces/${workspaceId}/prs/open`),
    
    getByNumber: (workspaceId: number, prNumber: number) =>
        apiFetch<PullRequestRow>(`/api/workspaces/${workspaceId}/prs/${prNumber}`),
};
