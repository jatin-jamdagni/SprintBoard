import { pullRequestsApi, snapshotsApi, syncApi } from "@repo/api-client";
import { type PullRequestRow } from "@repo/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StatCard } from "../components/stat-card";
import { PRListSkeleton } from "../components/pr-list-skeleton";
import { PRCard } from "../components/pr-card";
import { ChartSection } from "../components/charts/chart-section";
import VelocityChart from "../components/charts/velocity-chart";
import { LagChart } from "../components/charts/lag-chart";

const WORKSPACE_ID = 1;

type FilterStatus = "all" | "open" | "merged" | "draft";
const FILTERS: { label: string; value: FilterStatus }[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Merged", value: "merged" },
  { label: "Draft", value: "draft" },
];

export const Route = createFileRoute("/")({
  component: Dashboard,
});
function useStats(prs: PullRequestRow[]) {
  const open = prs.filter((p) => p.status === "open").length;
  const merged = prs.filter((p) => p.status === "merged").length;
  const noReview = prs.filter((p) => p.status === "open" && p.reviewCount === 0).length;

  const lags = prs
    .map((p) => {
      if (p.firstReviewAt == null) return null;
      const openedAt = new Date(p.openedAt).getTime();
      const firstReviewAt = new Date(p.firstReviewAt).getTime();
      return (firstReviewAt - openedAt) / 3_600_000;
    })
    .filter((lag): lag is number => lag != null);

  const avgLag =
    lags.length > 0 ? (lags.reduce((a, b) => a + b, 0) / lags.length).toFixed(1) : null;

  return {
    open,
    merged,
    noReview,
    avgLag,
  };
}

function Dashboard() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [showCharts, setShowCharts] = useState(true);

  const { data: prs = [], isLoading, isError } = useQuery({
    queryKey: ["prs", WORKSPACE_ID],
    queryFn: () => pullRequestsApi.getAll(WORKSPACE_ID),
  });

  const { data: snapshots = [] } = useQuery({
    queryKey: ["snapshots", WORKSPACE_ID],
    queryFn: () => snapshotsApi.getAll(WORKSPACE_ID),
  });

  const { data: rateLimit } = useQuery({
    queryKey: ["rate-limit"],
    queryFn: () => syncApi.getRateLimit(),
    staleTime: 60_000,
  });

  const syncMutation = useMutation({
    mutationFn: () => syncApi.syncWorkspace(WORKSPACE_ID),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prs", WORKSPACE_ID] });
      qc.invalidateQueries({ queryKey: ["snapshots", WORKSPACE_ID] });
      qc.invalidateQueries({ queryKey: ["rate-limit"] });
    },
  });

  const stats = useStats(prs);

  const filtered = prs.filter((pr) => (filter === "all" ? true : pr.status === filter));
  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            Dashboard
          </h1>
          <p className="text-[13px] text-[var(--text-subtle)] mt-0.5">
            {prs.length} pull requests tracked
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCharts((v) => !v)}
            className="btn"
          >
            {showCharts ? "Hide charts" : "Show charts"}
          </button>

          <button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="btn btn-primary"
          >
            {syncMutation.isPending ? "Syncing…" : "Sync PRs"}
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
        <StatCard
          label="Open PRs"
          value={stats.open}
          sub={`${stats.noReview} need review`}
        />
        <StatCard
          label="Merged"
          value={stats.merged}
          sub="all time"
        />
        <StatCard
          label="Avg review lag"
          value={stats.avgLag ? `${stats.avgLag}h` : "—"}
          sub="time to first review"
        />
        <StatCard
          label="Rate limit"
          value={rateLimit ? rateLimit.remaining.toLocaleString() : "—"}
          sub="GitHub requests left"
        />
      </div>

      {/* Sync error */}
      {syncMutation.isError && (
        <div className="px-4 py-3 rounded-lg bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)] text-sm text-[var(--status-danger-text)]">
          Sync failed:{" "}
          {syncMutation.error instanceof Error
            ? syncMutation.error.message
            : "Unknown error"}
        </div>
      )}

      {/* Charts */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSection
            title="PR velocity"
            description="Opened vs merged per day"
          >
            <VelocityChart snapshots={snapshots} />
          </ChartSection>

          <ChartSection
            title="Review lag"
            description="Hours to first review, top 10 PRs"
          >
            <LagChart prs={prs} />
          </ChartSection>
        </div>
      )}

      {/* PR list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[var(--text-primary)]">
            Pull requests
            <span className="ml-1.5 text-[11px] font-normal text-[var(--text-subtle)]">
              ({filtered.length})
            </span>
          </span>

          <div className="flex gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`filter-pill ${filter === f.value ? "active" : ""}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <PRListSkeleton count={4} />
        ) : isError ? (
          <div className="py-12 text-center text-sm text-[var(--text-subtle)]">
            Failed to load pull requests. Is the API running?
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--text-subtle)]">
            No {filter === "all" ? "" : filter} pull requests found.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((pr) => (
              <PRCard key={pr.id} pr={pr} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
