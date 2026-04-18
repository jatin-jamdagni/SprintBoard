import { describe, it, expect } from "vitest";
import {
  calcTimeToMerge,
  calcReviewLag,
 
  timeAgo,
  buildTimeLine,
} from "../pr-utils";
import type { PullRequestRow } from "@repo/types";

function makePR(overrides: Partial<PullRequestRow> = {}): PullRequestRow {
  const now = new Date();
  return {
    id:             1,
    workspaceId:    1,
    repo:           "org/repo",
    prNumber:       1,
    title:          "test",
    author:         "alice",
    avatarUrl:      null,
    status:         "open",
    isDraft:        false,
    openedAt:       new Date(now.getTime() - 48 * 3600_000).toISOString(),
    mergedAt:       null,
    firstReviewAt:  null,
    reviewCount:    0,
    reviewLagHours: null,
    additions:      10,
    deletions:      5,
    url:            "https://github.com/org/repo/pull/1",
    updatedAt:      now.toISOString(),
    ...overrides,
  } as PullRequestRow;
}

describe("calcTimeToMerge", () => {
  it("returns null if not merged", () => {
    expect(calcTimeToMerge(makePR())).toBeNull();
  });

  it("returns hours for sub-day merge", () => {
    const opened = new Date(Date.now() - 6 * 3600_000);
    const merged = new Date(Date.now());
    const pr = makePR({
      openedAt:  opened,
      mergedAt:  merged ,
      status:    "merged",
    });
    expect(calcTimeToMerge(pr)).toBe("6h");
  });

  it("returns days for multi-day merge", () => {
    const opened = new Date(Date.now() - 3 * 86400_000);
    const merged = new Date(Date.now());
    const pr = makePR({
      openedAt:  opened,
      mergedAt:  merged,
      status:    "merged",
    });
    expect(calcTimeToMerge(pr)).toBe("3d");
  });
});

describe("calcReviewLag", () => {
  it("returns null if no first review", () => {
    expect(calcReviewLag(makePR())).toBeNull();
  });

  it("calculates lag correctly", () => {
    const opened   = new Date(Date.now() - 10 * 3600_000);
    const reviewed = new Date(Date.now() - 6 * 3600_000);
    const pr = makePR({
      openedAt:      opened,
      firstReviewAt: reviewed,
    });
    expect(calcReviewLag(pr)).toBe("4h");
  });
});

describe("buildTimeline", () => {
  it("always starts with opened event", () => {
    const timeline = buildTimeLine(makePR());
    expect(timeline[0]?.type).toBe("opened");
  });

  it("includes review event when firstReviewAt is set", () => {
    const pr = makePR({
      firstReviewAt: new Date(Date.now() - 2 * 3600_000) ,
    });
    const timeline = buildTimeLine(pr);
    expect(timeline.some((e) => e.type === "review")).toBe(true);
  });

  it("includes merged event for merged PRs", () => {
    const pr = makePR({
      mergedAt: new Date() ,
      status:   "merged",
    });
    const timeline = buildTimeLine(pr);
    expect(timeline.some((e) => e.type === "merged")).toBe(true);
  });

  it("does not include merged event for open PRs", () => {
    const timeline = buildTimeLine(makePR({ status: "open" }));
    expect(timeline.every((e) => e.type !== "merged")).toBe(true);
  });
});

describe("timeAgo", () => {
  it("shows minutes for recent times", () => {
    const d = new Date(Date.now() - 30 * 60_000);
    expect(timeAgo(d)).toBe("30m ago");
  });

  it("shows hours for same-day times", () => {
    const d = new Date(Date.now() - 5 * 3600_000);
    expect(timeAgo(d)).toBe("5h ago");
  });

  it("shows days for older times", () => {
    const d = new Date(Date.now() - 3 * 86400_000);
    expect(timeAgo(d)).toBe("3d ago");
  });
});