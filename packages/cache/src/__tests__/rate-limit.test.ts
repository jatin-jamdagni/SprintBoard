import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateRateLimitFromHeaders } from "../rate-limit";

vi.mock("../helpers", () => ({
  cacheGet: vi.fn().mockResolvedValue(null),
  cacheSet: vi.fn().mockResolvedValue(undefined),
}));

describe("updateRateLimitFromHeaders", () => {
  it("does not throw with empty headers", () => {
    expect(() => updateRateLimitFromHeaders({})).not.toThrow();
  });

  it("does not throw with partial headers", () => {
    expect(() =>
      updateRateLimitFromHeaders({ "x-ratelimit-remaining": "100" })
    ).not.toThrow();
  });

  it("does not throw with full headers", () => {
    expect(() =>
      updateRateLimitFromHeaders({
        "x-ratelimit-remaining": "4500",
        "x-ratelimit-limit":     "5000",
        "x-ratelimit-reset":     String(Math.floor(Date.now() / 1000) + 3600),
        "x-ratelimit-used":      "500",
      })
    ).not.toThrow();
  });
});