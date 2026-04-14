import { pullRequestsApi, syncApi } from "@repo/api-client";
import {  type PullRequestRow } from "@repo/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StatCard } from "../components/stat-card";
import { PRListSkeleton } from "../components/pr-list-skeleton";
import { PRCard } from "../components/pr-card";



const WORKSPACE_ID = 1;

type FilterStatus = "all" | "open" | "merged" | "draft";

export const Route = createFileRoute("/")({
  component: Dashboard
})


function useStats(prs: PullRequestRow[]) {

  const open = prs.filter((p) => p.status === "open").length;
  const merged = prs.filter((p) => p.status === "merged").length
  const noReview = prs.filter((p) => p.status === "open" && p.reviewCount === 0).length;

  const lags = prs
    .map((p) => {
      if (p.firstReviewAt == null) return null;
      const openedAt = new Date(p.openedAt).getTime();
      const firstReviewAt = new Date(p.firstReviewAt).getTime();
      return (firstReviewAt - openedAt) / 3_600_000;
    })
    .filter((lag): lag is number => lag != null);

  const avgLag = lags.length > 0 ? (lags.reduce((a, b) => a + b, 0) / lags.length).toFixed(1) : null;

  return {
    open, merged, noReview, avgLag
  }
}

function Dashboard() {

  const qc = useQueryClient();

  const [filter, setFilter] = useState<FilterStatus>("all");

  const { data: prs = [], isLoading, isError } = useQuery({
    queryKey: ["prs", WORKSPACE_ID],
    queryFn: () => pullRequestsApi.getAll(WORKSPACE_ID)
  })
  const { data: rateLimit } = useQuery({
    queryKey: ["rate-limit"],
    queryFn: () => syncApi.getRateLimit(),
    staleTime: 60_000,
  });

  const syncMutation = useMutation({
    mutationFn: () => syncApi.syncWorkspace(WORKSPACE_ID),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["prs", WORKSPACE_ID] });
      qc.invalidateQueries({ queryKey: ["rate-limit"] });
      console.log(`Synced ${result.synced} PRs`);
    }
  });

  const stats = useStats(prs);

  const filtered = prs.filter((pr) => {
    if (filter === "all") return true;
    return pr.status === filter
  });

  const filters: {
    label: string, value: FilterStatus
  }[] = [
      { label: "All", value: "all" },
      { label: "Open", value: "open" },
      { label: "Merged", value: "merged" },
      { label: "Draft", value: "draft" }

    ];
 
  return (
    <div>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            Dashboard
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "var(--color-text-tertiary)",
              margin: "2px 0 0",
            }}
          >
            {prs.length} pull requests tracked
          </p>
        </div>

        <button
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          style={{
            fontSize: 13,
            padding: "7px 14px",
            borderRadius: 8,
            border: "0.5px solid var(--color-border-secondary)",
            background: "transparent",
            color: syncMutation.isPending
              ? "var(--color-text-tertiary)"
              : "var(--color-text-primary)",
            cursor: syncMutation.isPending ? "not-allowed" : "pointer",
          }}
        >
          {syncMutation.isPending ? "Syncing…" : "Sync PRs"}
        </button>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 10,
          marginBottom: 24,
        }}
      >
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
        <div
          style={{
            marginBottom: 16,
            padding: "10px 14px",
            borderRadius: 8,
            background: "var(--color-background-danger)",
            border: "0.5px solid var(--color-border-danger)",
            fontSize: 13,
            color: "var(--color-text-danger)",
          }}
        >
          Sync failed:{" "}
          {syncMutation.error instanceof Error
            ? syncMutation.error.message
            : "Unknown error"}
        </div>
      )}

      {/* PR list header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <span
          style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}
        >
          Pull requests
          <span
            style={{
              marginLeft: 6,
              fontSize: 11,
              fontWeight: 400,
              color: "var(--color-text-tertiary)",
            }}
          >
            ({filtered.length})
          </span>
        </span>

        <div style={{ display: "flex", gap: 6 }}>
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                fontSize: 11,
                padding: "3px 10px",
                borderRadius: 20,
                border: "0.5px solid var(--color-border-tertiary)",
                background:
                  filter === f.value
                    ? "var(--color-background-secondary)"
                    : "transparent",
                color:
                  filter === f.value
                    ? "var(--color-text-primary)"
                    : "var(--color-text-secondary)",
                cursor: "pointer",
                fontWeight: filter === f.value ? 500 : 400,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* PR list */}
      {isLoading ? (
        <PRListSkeleton count={4} />
      ) : isError ? (
        <div
          style={{
            padding: "32px 0",
            textAlign: "center",
            fontSize: 13,
            color: "var(--color-text-tertiary)",
          }}
        >
          Failed to load pull requests. Is the API running?
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            padding: "32px 0",
            textAlign: "center",
            fontSize: 13,
            color: "var(--color-text-tertiary)",
          }}
        >
          No {filter === "all" ? "" : filter} pull requests found.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((pr) => (
            <PRCard key={pr.id} pr={pr} />
          ))}
        </div>
      )}
    </div>
  );
}