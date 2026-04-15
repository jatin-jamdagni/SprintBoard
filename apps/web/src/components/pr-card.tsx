import type { PullRequestRow } from "@repo/types";
import { StatusBadge } from "./status-badge";
import { ReviewLagDot } from "./review-lag-dot";

type Props = { pr: PullRequestRow };

function timeAgo(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function initials(login: string): string {
  return login.slice(0, 2).toUpperCase();
}

export function PRCard({ pr }: Props) {
  const openedAt = new Date(pr.openedAt);
  const lagHours =
    pr.firstReviewAt != null
      ? Math.round(
        ((new Date(pr.firstReviewAt).getTime() - openedAt.getTime()) /
          3_600_000) *
        100
      ) / 100
      : null;
  return (
    <div className="card p-3.5 hover:border-[var(--border-strong)] transition-colors">

      {/* top row */}
      <div className="flex items-start gap-2.5 mb-2.5">
        <div className="w-7 h-7 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center text-[10px] font-medium text-[var(--text-muted)] shrink-0">
          {initials(pr.author)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
            {pr.title}
            <StatusBadge
              status={pr.status as "open" | "merged" | "closed" | "draft"}
              openedAt={openedAt}
              reviewCount={pr.reviewCount}
            />
          </p>
          <p className="text-[11px] text-[var(--text-subtle)] mt-0.5">
            #{pr.prNumber} · @{pr.author} · {timeAgo(openedAt)}
          </p>
        </div>


        <a href={pr.url}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-[var(--text-subtle)] hover:text-[var(--text-secondary)] px-1.5 py-0.5 rounded border border-[var(--border-default)] shrink-0 transition-colors"
        >
          GH ↗
        </a>
      </div>

      {/* footer */}
      <div className="flex items-center gap-4 border-t border-[var(--border-subtle)] pt-2">
        <span className="flex items-center gap-1.5 text-[11px] text-[var(--text-subtle)]">
          <ReviewLagDot lagHours={lagHours} reviewCount={pr.reviewCount} />
          {pr.reviewCount === 0
            ? "No reviews yet"
            : `${lagHours?.toFixed(1) ?? "?"}h to first review`}
        </span>
        <span className="text-[11px] text-[var(--text-subtle)]">
          {pr.reviewCount} review{pr.reviewCount !== 1 ? "s" : ""}
        </span>
        <span className="ml-auto text-[11px]">
          <span className="text-[var(--status-success-dot)]">+{pr.additions}</span>
          <span className="text-[var(--text-disabled)]"> / </span>
          <span className="text-[var(--status-danger-dot)]">-{pr.deletions}</span>
        </span>
      </div>
    </div>
  );
}
