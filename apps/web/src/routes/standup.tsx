import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { summariesApi, ApiError } from "@repo/api-client";

const WORKSPACE_ID = 1;

export const Route = createFileRoute("/standup")({
  component: StandupPage,
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith("**") && line.endsWith("**")) {
          return (
            <h3 key={i} className="text-sm font-semibold text-[var(--text-primary)] mt-5 first:mt-0">
              {line.replace(/\*\*/g, "")}
            </h3>
          );
        }
        if (line.startsWith("- ") || line.startsWith("• ")) {
          return (
            <div key={i} className="flex gap-2 text-sm text-[var(--text-secondary)]">
              <span className="text-[var(--text-subtle)] shrink-0 mt-0.5">–</span>
              <span>{line.slice(2)}</span>
            </div>
          );
        }
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return (
          <p key={i} className="text-sm text-[var(--text-secondary)]">
            {line}
          </p>
        );
      })}
    </div>
  );
}

function StandupPage() {
  const qc = useQueryClient();

  const {
    data: summary,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["summary-latest", WORKSPACE_ID],
    queryFn: () => summariesApi.getLatest(WORKSPACE_ID),
    retry: (_, err) => !(err instanceof ApiError && err.status === 404),
  });

  const generateMutation = useMutation({
    mutationFn: () => summariesApi.generate(WORKSPACE_ID),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["summary-latest", WORKSPACE_ID] });
    },
  });

  const isEmpty =
    isError && error instanceof ApiError && error.status === 404;

  return (
    <div className="max-w-2xl space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            Standup summary
          </h1>
          <p className="text-[13px] text-[var(--text-subtle)] mt-0.5">
            AI-generated from your latest PR activity
          </p>
        </div>

        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="btn btn-primary shrink-0"
        >
          {generateMutation.isPending ? (
            <span className="flex items-center gap-1.5">
              <span className="spinner w-3 h-3 border-[var(--text-on-brand)] border-t-transparent" />
              Generating…
            </span>
          ) : (
            "Generate summary"
          )}
        </button>
      </div>

      {/* Generate error */}
      {generateMutation.isError && (
        <div className="px-4 py-3 rounded-lg bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)] text-sm text-[var(--status-danger-text)]">
          {generateMutation.error instanceof Error
            ? generateMutation.error.message
            : "Generation failed"}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="card space-y-3 animate-pulse">
          <div className="h-3 bg-[var(--surface-muted)] rounded w-1/3" />
          <div className="space-y-2">
            <div className="h-2.5 bg-[var(--surface-muted)] rounded w-full" />
            <div className="h-2.5 bg-[var(--surface-muted)] rounded w-5/6" />
            <div className="h-2.5 bg-[var(--surface-muted)] rounded w-4/6" />
          </div>
        </div>
      )}

      {/* Empty state */}
      {isEmpty && !generateMutation.isPending && (
        <div className="card border-dashed border-[var(--border-strong)] p-10 text-center">
          <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
            No summary yet
          </p>
          <p className="text-[13px] text-[var(--text-subtle)] mb-4">
            Make sure you've synced your PRs, then hit generate.
          </p>
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="btn btn-primary"
          >
            Generate first summary
          </button>
        </div>
      )}

      {/* Generating spinner overlay on card */}
      {generateMutation.isPending && (
        <div className="card">
          <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
            <span className="spinner w-4 h-4 border-t-transparent shrink-0" />
            Asking Claude to summarize your team's activity…
          </div>
        </div>
      )}

      {/* Summary card */}
      {summary && !generateMutation.isPending && (
        <div className="card p-0 overflow-hidden">

          {/* card header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)]">
            <div className="flex items-center gap-2">
              <span className="badge badge-ai">
                AI summary
              </span>
              <span className="text-[11px] text-[var(--text-subtle)]">
                {formatDate(String(summary.generatedAt))}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[var(--text-subtle)]">
              <span>{summary.prCount} PRs</span>
              <span>{summary.mergedCount} merged</span>
            </div>
          </div>

          {/* content */}
          <div className="px-5 py-4">
            <MarkdownContent content={summary.content} />
          </div>

          {/* footer */}
          <div className="px-5 py-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <span className="text-[11px] text-[var(--text-subtle)]">
              Generated by {ANTHROPIC_MODEL_LABEL}
            </span>
            <button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="text-[11px] text-[var(--text-subtle)] hover:text-[var(--text-secondary)] transition-colors disabled:opacity-50"
            >
              Regenerate ↺
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const ANTHROPIC_MODEL_LABEL = "claude-sonnet-4-20250514";
