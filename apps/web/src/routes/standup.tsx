import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { summariesApi, ApiError } from "@repo/api-client";
import { useAuth } from "../context/auth-context";
import { useWSUpdates } from "../hooks/use-ws-updates";

export const Route = createFileRoute("/standup")({
  component: StandupPage,
});

const MODEL_LABEL = "claude-sonnet-4-20250514";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month:   "short",
    day:     "numeric",
    hour:    "2-digit",
    minute:  "2-digit",
  });
}

// Minimal markdown renderer — handles **bold** headings and - bullet lines
function SummaryContent({ content }: { content: string }) {
  return (
    <div className="space-y-1">
      {content.split("\n").map((line, i) => {
        // bold heading: **Shipped**
        if (/^\*\*.+\*\*$/.test(line.trim())) {
          return (
            <h3
              key={i}
              className="text-sm font-semibold text-text-primary mt-5 first:mt-0"
            >
              {line.replace(/\*\*/g, "")}
            </h3>
          );
        }
        // bullet line
        if (line.startsWith("- ") || line.startsWith("• ")) {
          return (
            <div key={i} className="flex gap-2 text-sm text-text-secondary">
              <span className="text-text-subtle shrink-0 mt-0.5 select-none">
                –
              </span>
              <span>{line.slice(2)}</span>
            </div>
          );
        }
        // blank line → small gap
        if (line.trim() === "") {
          return <div key={i} className="h-1" />;
        }
        // plain paragraph
        return (
          <p key={i} className="text-sm text-text-secondary">
            {line}
          </p>
        );
      })}
    </div>
  );
}

function StandupPage() {
  const auth        = useAuth();
  const qc          = useQueryClient();

  const workspaceId =
    auth.status === "authenticated" ? auth.user.workspaceId : 1;

  // live updates — summary.generated event refreshes the query
  useWSUpdates(workspaceId);

  // ── queries ──────────────────────────────────────────────
  const {
    data: summary,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["summary-latest", workspaceId],
    queryFn:  () => summariesApi.getLatest(workspaceId),
    retry: (_, err) =>
      !(err instanceof ApiError && err.status === 404),
  });

  // ── generate mutation ─────────────────────────────────────
  const generateMutation = useMutation({
    mutationFn: () => summariesApi.generate(workspaceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["summary-latest", workspaceId] });
    },
  });

  const isEmpty =
    isError && error instanceof ApiError && error.status === 404;

  return (
    <div className="max-w-2xl space-y-5">

      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">
            Standup summary
          </h1>
          <p className="text-[13px] text-text-muted mt-0.5">
            AI-generated from your latest PR activity
          </p>
        </div>

        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="btn btn-primary"
        >
          {generateMutation.isPending ? (
            <>
              <span className="spinner w-3 h-3" />
              Generating…
            </>
          ) : (
            "Generate summary"
          )}
        </button>
      </div>

      {/* ── Generate error ────────────────────────────────── */}
      {generateMutation.isError && (
        <div className="px-4 py-3 rounded-lg bg-status-danger-bg border border-status-danger-border text-sm text-status-danger-text">
          {generateMutation.error instanceof Error
            ? generateMutation.error.message
            : "Generation failed — make sure PRs are synced first"}
        </div>
      )}

      {/* ── Loading skeleton ──────────────────────────────── */}
      {isLoading && (
        <div className="bg-surface-card border border-border-default rounded-xl p-5 space-y-3 animate-pulse">
          <div className="h-3 bg-surface-muted rounded w-1/3" />
          <div className="space-y-2 pt-1">
            <div className="h-2.5 bg-surface-muted rounded w-full" />
            <div className="h-2.5 bg-surface-muted rounded w-5/6" />
            <div className="h-2.5 bg-surface-muted rounded w-4/6" />
          </div>
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────── */}
      {isEmpty && !generateMutation.isPending && (
        <div className="bg-surface-card border border-dashed border-border-strong rounded-xl p-12 text-center">
          <p className="text-sm font-medium text-text-primary mb-1">
            No summary yet
          </p>
          <p className="text-[13px] text-text-muted mb-5">
            Sync your PRs first, then generate a summary.
          </p>
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="btn btn-primary px-5 py-2"
          >
            Generate first summary
          </button>
        </div>
      )}

      {/* ── Generating in-progress card ───────────────────── */}
      {generateMutation.isPending && (
        <div className="bg-surface-card border border-border-default rounded-xl px-5 py-4">
          <div className="flex items-center gap-3 text-sm text-text-muted">
            <span className="w-4 h-4 rounded-full border-2 border-violet-300 border-t-violet-600 animate-spin shrink-0" />
            Asking Claude to summarise your team's activity…
          </div>
        </div>
      )}

      {/* ── Summary card ──────────────────────────────────── */}
      {summary && !generateMutation.isPending && (
        <div className="bg-surface-card border border-border-default rounded-xl overflow-hidden">

          {/* card header */}
          <div className="flex items-center justify-between px-5 py-3 bg-surface-subtle border-b border-border-subtle">
            <div className="flex items-center gap-2.5">
              <span className="badge badge-ai">
                AI summary
              </span>
              <span className="text-[11px] text-text-muted">
                {formatDate(String(summary.generatedAt))}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-text-muted">
              <span>{summary.prCount} PR{summary.prCount !== 1 ? "s" : ""}</span>
              <span>{summary.mergedCount} merged</span>
            </div>
          </div>

          {/* content */}
          <div className="px-5 py-4">
            <SummaryContent content={summary.content} />
          </div>

          {/* card footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-border-subtle">
            <span className="text-[11px] text-text-muted">
              {MODEL_LABEL}
            </span>
            <button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="text-[11px] text-text-muted hover:text-text-primary transition-colors disabled:opacity-40"
            >
              Regenerate ↺
            </button>
          </div>
        </div>
      )}
    </div>
  );
}