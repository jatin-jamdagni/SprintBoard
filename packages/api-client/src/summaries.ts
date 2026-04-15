import { apiFetch } from "./http";
import type { SprintSummaryRow } from "@repo/types";

export const summariesApi = {
    getLatest: (workspaceId: number) =>
        apiFetch<SprintSummaryRow>(`/api/workspaces/${workspaceId}/summaries/latest`),

    getAll: (workspaceId: number) =>
        apiFetch<SprintSummaryRow[]>(`/api/workspaces/${workspaceId}/summaries`),

    generate: (workspaceId: number) =>
        apiFetch<SprintSummaryRow>(`/api/workspaces/${workspaceId}/summaries/generate`, {
            method: "POST",
        }),
};