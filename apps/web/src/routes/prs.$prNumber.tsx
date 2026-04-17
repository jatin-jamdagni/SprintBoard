import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "../context/auth-context";
import { useQuery } from "@tanstack/react-query";
import { pullRequestsApi } from "@repo/api-client";
import { buildTimeLine, calcReviewLag, calcTimeToMerge, timeAgo } from "../lib/pr-utils";
import { StatusBadge } from "../components/status-badge";



export const Route = createFileRoute("/prs/$prNumber")({
    component: PRDetailPage,
});



const dotStyle: Record<string, string> = {
    opened: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    review: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
    merged: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
    closed: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
};

const dotLabel: Record<string, string> = {
    opened: "PR",
    review: "R",
    merged: "M",
    closed: "C",
};

function PRDetailPage() {

    const auth = useAuth();

    const { prNumber } = Route.useParams();

    const workspaceId = auth.status === "authenticated" ? auth.user.workspaceId : 1;

    const { data: pr, isLoading, isError } = useQuery({
        queryKey: ["pr", workspaceId, prNumber],
        queryFn: () => pullRequestsApi.getByNumber(workspaceId, Number(prNumber)),
    });

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse max-w-3xl">
                <div className="h-4 bg-surface-subtle  rounded w-1/3" />
                <div className="h-6  bg-surface-subtle  rounded w-2/3" />
                <div className="grid grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-16 bg-surface-subtle  rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }


    if (isError || !pr) {

        return (
            <div className="text-sm text-text-disabled py-12 text-center">
                PR not found.{" "}
                <Link to="/" className=" text-text-link hover:underline">
                    Back to dashboard
                </Link>

            </div>
        )
    }



    const openedAt = new Date(pr.openedAt);
    const timeline = buildTimeLine(pr);
    const timeToMerge = calcTimeToMerge(pr);
    const reviewLag = calcReviewLag(pr);










return (
    <div className="max-w-3xl space-y-6">

        {/* breadcrumb */}
        <div className="flex items-center gap-2 text-[12px] text-text-subtle">
            <Link to="/" className="hover:text-text-subtle/75 transition-colors">
                Dashboard
            </Link>
            <span>/</span>
            <span className="text-text-on-secondary">#{pr.prNumber}</span>
        </div>

        {/* header */}
        <div>
            <h1 className="text-xl font-semibold  mb-2 leading-snug">
                {pr.title}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
                <StatusBadge
                    status={pr.status as "open" | "merged" | "closed" | "draft"}
                    openedAt={openedAt}
                    reviewCount={pr.reviewCount}
                />
                <span className="text-[12px] text-neutral-400">
                    #{pr.prNumber} · @{pr.author} · {timeAgo(openedAt)}
                </span>

                <Link to={pr.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[12px] text-text-link hover:text-text-link/75 transition-colors"
                >
                    View on GitHub ↗
                </Link>
            </div>
        </div>

        {/* stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
                { label: "Time to merge", value: timeToMerge ?? "—" },
                { label: "First review", value: reviewLag ?? "No reviews" },
                { label: "Review count", value: pr.reviewCount },
                {
                    label: "Diff size",
                    value: `+${pr.additions}/-${pr.deletions}`
                },
            ].map((s) => (
                <div
                    key={s.label}
                    className="bg-surface-card rounded-lg p-3"
                >
                    <p className="text-[11px] text-text-subtle mb-1">{s.label}</p>
                    <p className="text-base font-semibold  text-text-primary">
                        {s.value}
                    </p>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

            {/* timeline */}
            <div className="sm:col-span-2">
                <p className="text-[11px] font-medium uppercase tracking-wider text-text-subtle mb-3">
                    Timeline
                </p>
                <div className="relative flex flex-col gap-0">
                    {timeline.map((event, i) => (
                        <div key={i} className="flex gap-3 relative">
                            {i < timeline.length - 1 && (
                                <div className="absolute left-2.5 top-6 w-px h-full text-border-strong" />
                            )}
                            <div
                                className={`w-5 h-5 rounded-full shrink-0 mt-0.5 flex items-center justify-center text-[8px] font-bold z-10 ${dotStyle[event.type]}`}
                            >
                                {dotLabel[event.type]}
                            </div>
                            <div className="pb-5 flex-1">
                                <p className="text-sm font-medium text-text-primary">
                                    {event.label}
                                </p>
                                <p className="text-[11px] text-text-subtle mt-0.5">
                                    {event.sub}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* sidebar */}
            <div className="space-y-4">
                <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 mb-2">
                        Diff
                    </p>
                    <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-lg p-3">
                        <div className="flex gap-1.5 mb-2">
                            <div
                                className="h-1.5 rounded-full bg-green-400"
                                style={{
                                    width: `${Math.min(
                                        80,
                                        (pr.additions / Math.max(pr.additions + pr.deletions, 1)) * 80
                                    )}px`,
                                }}
                            />
                            <div
                                className="h-1.5 rounded-full bg-red-400"
                                style={{
                                    width: `${Math.min(
                                        80,
                                        (pr.deletions / Math.max(pr.additions + pr.deletions, 1)) * 80
                                    )}px`,
                                }}
                            />
                        </div>
                        <p className="text-[11px] text-neutral-500">
                            <span className="text-green-600 dark:text-green-400">+{pr.additions}</span>
                            {" additions · "}
                            <span className="text-red-500 dark:text-red-400">-{pr.deletions}</span>
                            {" deletions"}
                        </p>
                    </div>
                </div>

                <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-text-subtle mb-2">
                        Status
                    </p>
                    <div className="bg-surface-subtle rounded-lg p-3 space-y-2">
                        {[
                            { label: "Draft", value: pr.isDraft ? "Yes" : "No" },
                            { label: "Repo", value: pr.repo.split("/")[1] ?? pr.repo },
                        ].map((row) => (
                            <div key={row.label} className="flex justify-between">
                                <span className="text-[11px] text-text-subtle">{row.label}</span>
                                <span className="text-[11px] text-text-muted font-medium">
                                    {row.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);
}