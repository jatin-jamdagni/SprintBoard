import { getWorkspaceById, upsertPR } from "@repo/db";
import { createGitHubClient, fetchPullRequests, fetchRateLimit } from "@repo/github";
import Elysia from "elysia";




function getGithubClient() {

    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error("GITHUB_TOKEN is not set");

    return createGitHubClient({ token });
}


export const syncRoutes = new Elysia({
    prefix: "/api/sync"
})
    .post("/workspace/:workspaceId", async ({ params, set }) => {

        const workspaceId = Number(params.workspaceId);

        const workspace = await getWorkspaceById(workspaceId);

        if (!workspace) {
            set.status = 404;

            return {
                success: false,
                error: "Workspace not found"
            }
        }

        const client = getGithubClient();

        const [owner, repo] = workspace.githubRepo.includes("/") ? workspace.githubRepo.split("/") : [workspace.githubOrg, workspace.githubRepo];

        if (!owner || !repo) {
            set.status = 400
            return {
                success: false, error: "Invalid github_repo format"
            }
        }

        console.log(`[sync] Fetching PRs for ${owner}/${repo}...`)

        const result = await fetchPullRequests({
            client,
            owner,
            repo,
            workspaceId,
            state: "all",
            perPage: 50
        })

        const upserted = await Promise.all(
            result.prs.map((pr) =>
                upsertPR({
                    ...pr,
                    openedAt: new Date(pr.openedAt),
                    mergedAt: pr.mergedAt ? new Date(pr.mergedAt) : null,
                    firstReviewAt: pr.firstReviewAt ? new Date(pr.firstReviewAt) : null
                })
            )
        );

        console.log(`[sync] Upsetted ${upserted.length} PRs`);

        return {
            success: true,
            data: {
                synced: upserted.length,
                rateLimitRemaining: result.rateLimitRemaining,
                fetchedAt: result.fetchedAt
            }
        }
    })


    .get("/rate-limit", async () => {
        const client = getGithubClient();

        const data = await fetchRateLimit(client);
        return {
            success: true,
            data
        }
    })