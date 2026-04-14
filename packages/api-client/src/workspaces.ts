import { apiFetch } from "./http";
import type { WorkspaceRow } from "@repo/types";
export const workspacesApi = {
    getAll: () =>
        apiFetch<WorkspaceRow[]>("/api/workspaces"),

    getById: (id: number) =>
        apiFetch<WorkspaceRow>(`/api/workspaces/${id}`),

    create: (data: { name: string; githubOrg: string; githubRepo: string }) =>
        apiFetch<WorkspaceRow>("/api/workspaces", {
            method: "POST",
            body: JSON.stringify(data),
        }),
};
