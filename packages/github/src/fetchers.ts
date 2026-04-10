import type { GitHubClient } from "./client";
import { transformPR } from "./transformer";
import type { PullRequest } from "@repo/types";

export type FetchPRsOptions = {
    client: GitHubClient;
    owner: string;
    repo: string;
    workspaceId: number;
    state?: "open" | "closed" | "all";
    perPage?: number;
};

export type FetchResult = {
    prs: Omit<PullRequest, "id">[];
    rateLimitRemaining: number | null;
    fetchedAt: string;
};

export async function fetchPullRequests(
    options: FetchPRsOptions
): Promise<FetchResult> {
    const {
        client,
        owner,
        repo,
        workspaceId,
        state = "open",
        perPage = 30,
    } = options;

    const { data: rawPRs, headers } = await client.rest.pulls.list({
        owner,
        repo,
        state,
        per_page: perPage,
        sort: "updated",
        direction: "desc",
    });

    const rateLimitRemaining = headers["x-ratelimit-remaining"]
        ? Number(headers["x-ratelimit-remaining"])
        : null;

    const prs = await Promise.all(
        rawPRs.map(async (pr) => {

            const [{ data: full }, { data: reviews }] = await Promise.all([
                client.rest.pulls.get({
                    owner,
                    repo,
                    pull_number: pr.number
                }),
                client.rest.pulls.listReviews({
                    owner,
                    repo,
                    pull_number: pr.number
                })
            ])
            return transformPR(full, reviews, workspaceId ,`${owner}/${repo}`);
        })
    );

    return {
        prs,
        rateLimitRemaining,
        fetchedAt: new Date().toISOString(),
    };
}

export async function fetchSinglePR(options: {
    client: GitHubClient;
    owner: string;
    repo: string;
    prNumber: number;
    workspaceId: number;
}): Promise<Omit<PullRequest, "id"> | null> {
    const { client, owner, repo, prNumber, workspaceId } = options;

    try {
        const [{ data: pr }, { data: reviews }] = await Promise.all([
            client.rest.pulls.get({ owner, repo, pull_number: prNumber }),
            client.rest.pulls.listReviews({ owner, repo, pull_number: prNumber }),
        ]);

        return transformPR(pr as Parameters<typeof transformPR>[0], reviews, workspaceId, `${owner}/${repo}`);
    } catch (err: unknown) {
        if (
            typeof err === "object" &&
            err !== null &&
            "status" in err &&
            (err as { status: number }).status === 404
        ) {
            return null;
        }
        throw err;
    }
}

export async function fetchRateLimit(client: GitHubClient) {
    const { data } = await client.rest.rateLimit.get();
    return {
        limit: data.rate.limit,
        remaining: data.rate.remaining,
        resetAt: new Date(data.rate.reset * 1000).toISOString(),
        used: data.rate.used,
    };
}