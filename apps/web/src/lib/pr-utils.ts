import { PullRequestRow } from "@repo/types";


export function calcTimeToMerge(pr: PullRequestRow): string | null {
    if (!pr.mergedAt) return null;

    const ms = new Date(pr.mergedAt).getTime() - new Date(pr.openedAt).getTime();

    const hours = ms / 3_600_000;

    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${Math.round(hours)}h`;

    return `${Math.round(hours / 24)}d`;
}


export function calcReviewLag(pr: PullRequestRow): string | null {

    if (!pr.firstReviewAt) return null;

    const ms = new Date(pr.firstReviewAt).getTime() - new Date(pr.openedAt).getTime();

    const hours = ms / 3_600_000;

    if (hours < 1) return `${Math.round(hours * 60)}m`;

    return `${Math.round(hours)}h`
}


export type TimeLineEvent = {
    type: "opened" | "review" | "merged" | "closed";
    label: string;
    sub: string;
    at: Date;
}
export function timeAgo(date: Date): string {
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}


export function buildTimeLine(pr: PullRequestRow): TimeLineEvent[] {
    const events: TimeLineEvent[] = [];


    const openedAt = new Date(pr.openedAt);

    events.push({
        type: "opened",
        label: `Opened by @${pr.author}`,
        sub: `${timeAgo(openedAt)}`,
        at: openedAt
    })

    if (pr.firstReviewAt) {
        const reviewedAt = new Date(pr.firstReviewAt);

        const lag = calcReviewLag(pr);
        events.push({
            type: "review",
            label: "First review",
            sub: `${timeAgo(reviewedAt)}  · ${lag} after open`,
            at: reviewedAt
        })
    }

    if (pr.mergedAt) {
        const mergedAt = new Date(pr.mergedAt);

        const ttm = calcTimeToMerge(pr);

        events.push({
            type: "merged",
            label: "Merged",
            sub: `${timeAgo(mergedAt)}  · ${ttm} after open`,
            at: mergedAt
            ,
        });
    } else if (pr.status === "closed") {
        events.push({
            type: "closed",
            label: "Closed without merging",
            sub: timeAgo(openedAt),
            at: openedAt
        })
    }


    return events;

}