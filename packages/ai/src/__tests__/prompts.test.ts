import { describe, it, expect } from "vitest";
 import type { PullRequestRow } from "@repo/types";
import { buildStandupPrompt } from "../utils/prompt";

function makePR(overrides: Partial<PullRequestRow> = {}): PullRequestRow {
  return {
    id:              1,
    workspaceId:     1,
    repo:            "org/repo",
    prNumber:        1,
    title:           "feat: test PR",
    author:          "alice",
    avatarUrl:       null,
    status:          "open",
    isDraft:         false,
    openedAt:        new Date(Date.now() - 2 * 3600_000).toISOString(),
    mergedAt:        null,
    firstReviewAt:   null,
    reviewCount:     0,
    reviewLagHours:  null,
    additions:       10,
    deletions:       5,
    url:             "https://github.com/org/repo/pull/1",
    updatedAt:       new Date().toISOString(),
    ...overrides,
  } as PullRequestRow;
}

describe("buildStandupPrompt", () => {
  it("includes repo name in prompt", () => {
    const prompt = buildStandupPrompt([], "acme", "frontend");
    expect(prompt).toContain("acme/frontend");
  });

  it("shows merged PR count correctly", () => {
    const prs = [
      makePR({ status: "merged", mergedAt: new Date() }),
      makePR({ status: "merged", mergedAt: new Date() }),
      makePR({ status: "open" }),
    ];
    const prompt = buildStandupPrompt(prs, "acme", "frontend");
    expect(prompt).toContain("Merged PRs (2)");
    expect(prompt).toContain("Open PRs (1)");
  });

  it("identifies stale PRs correctly", () => {
    const stalePR = makePR({
      status:       "open",
      reviewCount:  0,
      openedAt:     new Date(Date.now() - 30 * 3600_000),
    });
    const prompt = buildStandupPrompt([stalePR], "acme", "frontend");
    expect(prompt).toContain("Stale PRs needing attention (1)");
  });

  it("does not mark reviewed PR as stale", () => {
    const reviewedPR = makePR({
      status:        "open",
      reviewCount:   1,
      firstReviewAt: new Date(),
      openedAt:      new Date(Date.now() - 30 * 3600_000),
    });
    const prompt = buildStandupPrompt([reviewedPR], "acme", "frontend");
    expect(prompt).toContain("Stale PRs needing attention (0)");
  });

  it("includes PR number and author in output", () => {
    const pr = makePR({ prNumber: 42, author: "bob", title: "fix: the bug" });
    const prompt = buildStandupPrompt([pr], "acme", "frontend");
    expect(prompt).toContain("#42");
    expect(prompt).toContain("@bob");
    expect(prompt).toContain("fix: the bug");
  });

  it("handles empty PR list gracefully", () => {
    const prompt = buildStandupPrompt([], "acme", "frontend");
    expect(prompt).toContain("Merged PRs (0)");
    expect(prompt).toContain("Open PRs (0)");
    expect(prompt).not.toThrow;
  });
});