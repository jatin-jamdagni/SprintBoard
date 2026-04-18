import { expect, it } from "vitest"
import { describe } from "bun:test";
import { transformPR } from "../transformer";




const mockPR = {
    number: 42,
    title: "feat: add dark mode",
    state: "open" as const,
    draft: false,
    merged_at: null,
    html_url: "https://github.com/org/repo/pull/42",
    created_at: "2024-01-10T10:00:00Z",
    additions: 120,
    deletions: 30,
    user: {
        login: "alice",
        avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
    },
} as Parameters<typeof transformPR>[0];


const mockReviews = [
    {
        submitted_at: "2024-01-10T14:00:00Z",
        state: "APPROVED",
        user: { login: "bob" },
    },
    {
        submitted_at: "2024-01-10T16:00:00Z",
        state: "COMMENTED",
        user: { login: "carol" },
    },
] as Parameters<typeof transformPR>[1];



describe("transformPR", () => {

    it("maps basic fields correctly", () => {
        const pr = transformPR(mockPR, [], 1, "org/repo");
        expect(pr.prNumber).toBe(42);
        expect(pr.title).toBe("feat: add dark mode");
        expect(pr.author).toBe("alice");
        expect(pr.repo).toBe("org/repo");
        expect(pr.workspaceId).toBe(1);
        expect(pr.additions).toBe(120);
        expect(pr.deletions).toBe(30);
    });


    it("resolves status as open for non-draft open PR", () => {
        const pr = transformPR(mockPR, [], 1, "org/repo");
        expect(pr.status).toBe("open");
    });


    it("resolves status as draft for draft PR", () => {
        const pr = transformPR({ ...mockPR, draft: true }, [], 1, "org/repo");
        expect(pr.status).toBe("draft");
    });


    it("resolves status as merged when merged_at is set", () => {
        const pr = transformPR(
            { ...mockPR, merged_at: "2024-01-11T10:00:00Z", state: "closed" as const },
            [],
            1,
            "org/repo"
        );
        expect(pr.status).toBe("merged");
        expect(pr.mergedAt).toBe("2024-01-11T10:00:00Z");
    });

})