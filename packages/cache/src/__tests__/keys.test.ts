import { describe, it, expect } from "vitest";
import { CacheKeys, CacheTTL } from "../keys";

describe("CacheKeys", () => {
  it("generates unique PR list keys per owner/repo/state", () => {
    const a = CacheKeys.prs("org1", "repo1", "open");
    const b = CacheKeys.prs("org1", "repo1", "closed");
    const c = CacheKeys.prs("org2", "repo1", "open");
    expect(a).not.toBe(b);
    expect(a).not.toBe(c);
  });

  it("generates unique single PR keys", () => {
    const a = CacheKeys.singlePR("org", "repo", 1);
    const b = CacheKeys.singlePR("org", "repo", 2);
    expect(a).not.toBe(b);
  });

  it("workspace keys include workspaceId", () => {
    const key = CacheKeys.workspacePRs(42);
    expect(key).toContain("42");
  });

  it("keys contain no whitespace", () => {
    const keys = [
      CacheKeys.prs("my org", "my repo", "open"),
      CacheKeys.rateLimit(),
      CacheKeys.workspacePRs(1),
    ];
    keys.forEach((k) => {
      expect(k).not.toMatch(/\s/);
    });
  });
});

describe("CacheTTL", () => {
  it("all TTLs are positive numbers", () => {
    Object.values(CacheTTL).forEach((ttl) => {
      expect(ttl).toBeGreaterThan(0);
    });
  });

  it("DB cache TTLs are shorter than GitHub TTLs", () => {
    expect(CacheTTL.DB_PRS).toBeLessThan(CacheTTL.GITHUB_PRS);
  });
});