import type { GitHubClient } from "./client";
import { transformPR } from "./transformer";
import type { PullRequest } from "@repo/types";
import {
  cacheGetOrSet,
  cacheGet,
  cacheSet,
  cacheDel,
  CacheKeys,
  CacheTTL,
  isRateLimited,
  updateRateLimitFromHeaders,
  saveRateLimitState,
} from "@repo/cache";

export type FetchPRsOptions = {
  client: GitHubClient;
  owner: string;
  repo: string;
  workspaceId: number;
  state?: "open" | "closed" | "all";
  perPage?: number;
  bypassCache?: boolean;
};

export type FetchResult = {
  prs: Omit<PullRequest, "id">[];
  rateLimitRemaining: number | null;
  fetchedAt: string;
  fromCache: boolean;
};

async function fetchReviews(
  client: GitHubClient,
  owner: string,
  repo: string,
  prNumber: number
) {
  return cacheGetOrSet(
    CacheKeys.reviews(owner, repo, prNumber),
    async () => {
      const { data } = await client.rest.pulls.listReviews({
        owner,
        repo,
        pull_number: prNumber,
      });
      return data;
    },
    { ttlSeconds: CacheTTL.GITHUB_REVIEWS }
  );
}

export async function fetchPullRequests(options: FetchPRsOptions): Promise<FetchResult> {
  const {
    client,
    owner,
    repo,
    workspaceId,
    state = "open",
    perPage = 30,
    bypassCache = false,
  } = options;

  if (await isRateLimited()) {
    throw new Error(
      "GitHub rate limit critical — request blocked. Try again after the reset window."
    );
  }

  const cacheKey = CacheKeys.prs(owner, repo, state);

  if (!bypassCache) {
    const cached = await cacheGet<Omit<PullRequest, "id">[]>(cacheKey);
    if (cached) {
      console.log(`[github] cache hit prs owner=${owner} repo=${repo} state=${state}`);
      return {
        prs: cached,
        rateLimitRemaining: null,
        fetchedAt: new Date().toISOString(),
        fromCache: true,
      };
    }
  }

  const { data: rawPRs, headers } = await client.rest.pulls.list({
    owner,
    repo,
    state,
    per_page: perPage,
    sort: "updated",
    direction: "desc",
  });

  updateRateLimitFromHeaders(headers as Record<string, string | undefined>);

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
        fetchReviews(client, owner, repo, pr.number).then((data) => ({ data }))
      ])
      return transformPR(full, reviews, workspaceId, `${owner}/${repo}`);
    })
  );


  await cacheSet(cacheKey, prs, { ttlSeconds: CacheTTL.GITHUB_PRS });

  return {
    prs,
    rateLimitRemaining,
    fetchedAt: new Date().toISOString(),
    fromCache: false,
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

  if (await isRateLimited()) {
    throw new Error("GitHub rate limit critical — request blocked.");
  }

  try {
    const [{ data: pr, headers }, reviews] = await Promise.all([
      client.rest.pulls.get({ owner, repo, pull_number: prNumber }),
      fetchReviews(client, owner, repo, prNumber),
    ]);

    updateRateLimitFromHeaders(headers as Record<string, string | undefined>);

    await cacheDel(CacheKeys.singlePR(owner, repo, prNumber));
    await cacheDel(CacheKeys.reviews(owner, repo, prNumber));

    return transformPR(
      pr as Parameters<typeof transformPR>[0],
      reviews,
      workspaceId,
      `${owner}/${repo}`
    );
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
  return cacheGetOrSet(
    CacheKeys.rateLimit(),
    async () => {
      const { data } = await client.rest.rateLimit.get();
      const state = {
        limit: data.rate.limit,
        remaining: data.rate.remaining,
        resetAt: new Date(data.rate.reset * 1000).toISOString(),
        used: data.rate.used,
      };
      await saveRateLimitState(state);
      return state;
    },
    { ttlSeconds: CacheTTL.RATE_LIMIT }
  );
}
