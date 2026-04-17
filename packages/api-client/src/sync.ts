import { apiFetch } from "./http";

type SyncResult = {
  synced: number;
  rateLimitRemaining: number | null;
  fetchedAt: string;
};

type RateLimit = {
  limit: number;
  remaining: number;
  resetAt: string;
  used: number;
};

export const syncApi = {
  syncWorkspace: (workspaceId: number) =>
    apiFetch<SyncResult>(`/api/sync/workspace/${workspaceId}`, {
      method: "POST",
    }),

  getRateLimit: () =>
    apiFetch<RateLimit>("/api/sync/rate-limit"),

  computeSnapshots: (workspaceId: number)=>
    apiFetch<{computed: number}>(
      `/api/sync/workspace/${workspaceId}/snapshots`, {
        method: "POST"
      }
    )
};


