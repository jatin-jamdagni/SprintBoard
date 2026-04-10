import { createGitHubClient } from "./client";
import { fetchPullRequests, fetchRateLimit } from "./fetchers";



const token = process.env.GITHUB_TOKEN;
const owner = process.env.GITHUB_ORG;
const repo = process.env.GITHUB_REPO;


if (!token || !owner || !repo) {
    console.error("Missing GITHUB_TOKEN, GITHUB_ORG or GITHUB_REPO in env");
    process.exit(1);
}

const client = createGitHubClient({ token });

console.log("Checking rate limit...");

const rateLimit = await fetchRateLimit(client);

console.log(`  Remaining: ${rateLimit.remaining}/${rateLimit.limit}`);
console.log(`  Resets at: ${rateLimit.resetAt}`);


console.log(`\nFetching PRs from ${owner}/${repo}...`);
const result = await fetchPullRequests({
    client,
    owner,
    repo,
    workspaceId: 1,
    state: "open",
    perPage: 5,
})


console.log(`\nFetched ${result.prs.length} PRs:`)

for (const pr of result.prs) {
    console.log(`  #${pr.prNumber} [${pr.status}] "${pr.title}" by @${pr.author}`);
    console.log(`    Reviews: ${pr.reviewCount} | Lag: ${pr.reviewLagHours ?? "n/a"}h | +${pr.additions}/-${pr.deletions}`);
}



console.log(`\nRate limit remaining: ${result.rateLimitRemaining}`);
console.log(`Fetched at: ${result.fetchedAt}`);
