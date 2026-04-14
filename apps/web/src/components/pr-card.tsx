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
    <div
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 10,
        padding: "12px 14px",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLDivElement).style.borderColor =
          "var(--color-border-secondary)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLDivElement).style.borderColor =
          "var(--color-border-tertiary)")
      }
    >
      {/* top row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "var(--color-background-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 500,
            color: "var(--color-text-secondary)",
            flexShrink: 0,
          }}
        >
          {initials(pr.author)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--color-text-primary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginBottom: 3,
            }}
          >
            {pr.title}
            <StatusBadge
              status={pr.status as "open" | "merged" | "closed" | "draft"}
              openedAt={openedAt}
              reviewCount={pr.reviewCount}
            />
          </div>
          <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>
            #{pr.prNumber} · @{pr.author} · {timeAgo(openedAt)}
          </div>
        </div>

        
          <a href={pr.url}
          target="_blank"
          rel="noreferrer"
          style={{
            fontSize: 11,
            color: "var(--color-text-tertiary)",
            textDecoration: "none",
            flexShrink: 0,
            padding: "2px 6px",
            borderRadius: 4,
            border: "0.5px solid var(--color-border-tertiary)",
          }}
        >
          GH ↗
        </a>
      </div>

      {/* footer row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          borderTop: "0.5px solid var(--color-border-tertiary)",
          paddingTop: 8,
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 11,
            color: "var(--color-text-tertiary)",
          }}
        >
          <ReviewLagDot lagHours={lagHours} reviewCount={pr.reviewCount} />
          {pr.reviewCount === 0
            ? "No reviews yet"
            : `${lagHours?.toFixed(1) ?? "?"}h to first review`}
        </span>

        <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>
          {pr.reviewCount} review{pr.reviewCount !== 1 ? "s" : ""}
        </span>

        <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginLeft: "auto" }}>
          <span style={{ color: "#16a34a" }}>+{pr.additions}</span>
          {" / "}
          <span style={{ color: "#dc2626" }}>-{pr.deletions}</span>
        </span>
      </div>
    </div>
  );
}
