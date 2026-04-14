import type { PullRequest, PRStatus } from "@repo/types";
import type { Octokit } from "@octokit/rest";

type OctokitPR = Awaited<
  ReturnType<Octokit["rest"]["pulls"]["get"]>
>["data"];

type OctokitReview = Awaited<
  ReturnType<Octokit["rest"]["pulls"]["listReviews"]>
>["data"][number];

function resolveStatus(pr: OctokitPR): PRStatus {
  if (pr.draft) return "draft";
  if (pr.merged_at) return "merged";
  if (pr.state === "closed") return "closed";
  return "open";
}

function resolveReviewLagHours(
  openedAt: string,
  firstReviewAt: string | null
): number | null {
  if (!firstReviewAt) return null;
  const opened = new Date(openedAt).getTime();
  const reviewed = new Date(firstReviewAt).getTime();
  return Math.round(((reviewed - opened) / 3_600_000) * 100) / 100;
}

function resolveFirstReviewAt(
  reviews: OctokitReview[]
): string | null {
  const submitted = reviews
    .filter((r) => r.submitted_at)
    .map((r) => r.submitted_at as string)
    .sort();
  return submitted[0] ?? null;
}

export function transformPR(
  pr: OctokitPR,
  reviews: OctokitReview[],
  workspaceId: number,
  repo: string
): Omit<PullRequest, "id"> {
  const firstReviewAt = resolveFirstReviewAt(reviews);

  return {
    workspaceId,
    repo,
    prNumber: pr.number,
    title: pr.title,
    author: pr.user?.login ?? "unknown",
    avatarUrl: pr.user?.avatar_url ?? null,
    status: resolveStatus(pr),
    isDraft: pr.draft ?? false,
    openedAt: pr.created_at,
    mergedAt: pr.merged_at ?? null,
    firstReviewAt,
    reviewCount: reviews.length,
    reviewLagHours: resolveReviewLagHours(pr.created_at, firstReviewAt),
    additions: pr.additions ?? 0,
    deletions: pr.deletions ?? 0,
    url: pr.html_url,
  };
}