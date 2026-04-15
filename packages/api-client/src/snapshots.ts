import { DailySnapshotRow } from "@repo/types"
import { apiFetch } from "./http"





export const snapshotsApi = {
    getAll: (workspaceId: number)=>{
        apiFetch<DailySnapshotRow[]>(`/api/workspaces/${workspaceId}/snapshots`);
    }
}