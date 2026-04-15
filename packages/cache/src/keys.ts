export const CacheKeys = {
    prs: (owner: string, repo: string, state: string) =>
        `gh:prs:${owner}:${repo}:${state}`,

    singlePR: (owner: string, repo: string, prNumber: number) =>
        `gh:pr:${owner}:${repo}:${prNumber}`,

    reviews: (owner: string, repo: string, prNumber: number) =>
        `gh:reviews:${owner}:${repo}:${prNumber}`,

    rateLimit: () =>
        `gh:rate-limit`,

    workspacePRs: (workspaceId: number) =>
        `db:prs:workspace:${workspaceId}`,

    workspaceSnapshots: (workspaceId: number) =>
        `db:snapshots:workspace:${workspaceId}`,

    latestSummary: (workspaceId: number) =>
        `db:summary:latest:${workspaceId}`,
} as const;

export const CacheTTL = {
    GITHUB_PRS: 5 * 60,           // 5 min  — GitHub PR list
    GITHUB_REVIEWS: 5 * 60,       // 5 min  — PR reviews
    GITHUB_PR: 2 * 60,            // 2 min  — single PR (webhooks make this fresher)
    RATE_LIMIT: 60,               // 1 min  — rate limit status
    DB_PRS: 30,                   // 30 sec — DB query results
    DB_SNAPSHOTS: 5 * 60,         // 5 min  — daily snapshots (slow changing)
    DB_SUMMARY: 10 * 60,          // 10 min — AI summaries (expensive to generate)
} as const;