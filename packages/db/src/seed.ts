import { db } from "./client";
import { workspaces, pullRequests, dailySnapshots } from "./schema";

console.log("Seeding database...");

// 1. Workspace
const [workspace] = await db
  .insert(workspaces)
  .values({
    name: "SprintBoard Dev",
    githubOrg: "your-org",
    githubRepo: "your-repo",
  })
  .returning();

console.log(`Created workspace: ${workspace!.id}`);

// 2. Pull requests — realistic fake data
const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400_000);

const prs = [
  {
    workspaceId: workspace!.id,
    repo: "your-org/your-repo",
    prNumber: 101,
    title: "feat: add user authentication with JWT",
    author: "alice",
    avatarUrl: "https://avatars.githubusercontent.com/u/1?v=4",
    status: "merged" as const,
    isDraft: false,
    openedAt: daysAgo(5),
    mergedAt: daysAgo(3),
    firstReviewAt: daysAgo(4),
    reviewCount: 3,
    additions: 420,
    deletions: 38,
    url: "https://github.com/your-org/your-repo/pull/101",
  },
  {
    workspaceId: workspace!.id,
    repo: "your-org/your-repo",
    prNumber: 102,
    title: "fix: resolve race condition in payment processor",
    author: "bob",
    avatarUrl: "https://avatars.githubusercontent.com/u/2?v=4",
    status: "open" as const,
    isDraft: false,
    openedAt: daysAgo(3),
    mergedAt: null,
    firstReviewAt: daysAgo(2),
    reviewCount: 1,
    additions: 85,
    deletions: 12,
    url: "https://github.com/your-org/your-repo/pull/102",
  },
  {
    workspaceId: workspace!.id,
    repo: "your-org/your-repo",
    prNumber: 103,
    title: "chore: upgrade all dependencies to latest",
    author: "carol",
    avatarUrl: "https://avatars.githubusercontent.com/u/3?v=4",
    status: "open" as const,
    isDraft: true,
    openedAt: daysAgo(1),
    mergedAt: null,
    firstReviewAt: null,
    reviewCount: 0,
    additions: 210,
    deletions: 198,
    url: "https://github.com/your-org/your-repo/pull/103",
  },
  {
    workspaceId: workspace!.id,
    repo: "your-org/your-repo",
    prNumber: 104,
    title: "feat: dashboard analytics v2",
    author: "alice",
    avatarUrl: "https://avatars.githubusercontent.com/u/1?v=4",
    status: "merged" as const,
    isDraft: false,
    openedAt: daysAgo(7),
    mergedAt: daysAgo(5),
    firstReviewAt: daysAgo(6),
    reviewCount: 4,
    additions: 680,
    deletions: 120,
    url: "https://github.com/your-org/your-repo/pull/104",
  },
  {
    workspaceId: workspace!.id,
    repo: "your-org/your-repo",
    prNumber: 105,
    title: "fix: memory leak in websocket handler",
    author: "dave",
    avatarUrl: "https://avatars.githubusercontent.com/u/4?v=4",
    status: "open" as const,
    isDraft: false,
    openedAt: daysAgo(2),
    mergedAt: null,
    firstReviewAt: null,
    reviewCount: 0,
    additions: 45,
    deletions: 30,
    url: "https://github.com/your-org/your-repo/pull/105",
  },
];

await db.insert(pullRequests).values(prs);
console.log(`Seeded ${prs.length} pull requests`);

// 3. Daily snapshots — last 7 days
const snapshots = Array.from({ length: 7 }, (_, i) => {
  const d = daysAgo(6 - i);
  const dateStr = d.toISOString().split("T")[0]!;
  return {
    workspaceId: workspace!.id,
    date: dateStr,
    prsOpened: Math.floor(Math.random() * 4) + 1,
    prsMerged: Math.floor(Math.random() * 3),
    avgReviewLagHours: (Math.random() * 20 + 2).toFixed(2),
  };
});

await db.insert(dailySnapshots).values(snapshots);
console.log(`Seeded ${snapshots.length} daily snapshots`);

console.log("Seed complete");
process.exit(0);