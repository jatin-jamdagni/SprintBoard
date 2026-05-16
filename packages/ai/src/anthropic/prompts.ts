import type { PullRequestRow } from "@repo/types";

export function buildStandupPrompt(
    prs: PullRequestRow[],
    org: string,
    repo: string
): string {
    const merged = prs.filter((p) => p.status === "merged");
    const open = prs.filter((p) => p.status === "open" && !p.isDraft);
    const drafts = prs.filter((p) => p.isDraft);
    const stale = open.filter((p) => {
        const hoursOpen = (Date.now() - new Date(p.openedAt).getTime()) / 3_600_000;
        return p.reviewCount === 0 && hoursOpen > 24;
    });

    const formatPR = (pr: PullRequestRow) =>
        `  - #${pr.prNumber} "${pr.title}" by @${pr.author}` +
        (pr.reviewCount > 0 ? ` (${pr.reviewCount} review${pr.reviewCount > 1 ? "s" : ""})` : " (no reviews)") +
        (pr.additions || pr.deletions ? ` [+${pr.additions}/-${pr.deletions}]` : "");

    return `You are an engineering team assistant generating a daily standup update.

            Repository: ${org}/${repo}
            Generated at: ${new Date().toUTCString()}

            RECENT ACTIVITY:

            Merged PRs (${merged.length}):
            ${merged.length > 0 ? merged.map(formatPR).join("\n") : "  None"}

            Open PRs (${open.length}):
            ${open.length > 0 ? open.map(formatPR).join("\n") : "  None"}

            Draft PRs (${drafts.length}):
            ${drafts.length > 0 ? drafts.map(formatPR).join("\n") : "  None"}

            Stale PRs needing attention (${stale.length}):
            ${stale.length > 0 ? stale.map(formatPR).join("\n") : "  None"}

            Write a concise standup summary for this engineering team. Format it as:

            **Shipped**
            [bullet points for merged PRs, grouped by theme if possible]

            **In Progress**
            [bullet points for open PRs with review status]

            **Needs Attention**
            [bullet points for stale PRs or bottlenecks]

            **Team Pulse**
            [one sentence about overall velocity and health]

            Be specific, mention PR numbers and authors. Keep the entire summary under 200 words. Use plain language, not corporate speak.`;
}