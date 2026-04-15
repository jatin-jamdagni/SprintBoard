import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
 
  ResponsiveContainer,
} from "recharts";
import type { PullRequestRow } from "@repo/types";
import type { ReactNode } from "react";

type Props = { prs: PullRequestRow[] };

function lagColor(hours: number): string {
  if (hours <= 8) return "var(--lag-good)";
  if (hours <= 24) return "var(--lag-warn)";
  return "var(--lag-crit)";
}

function getReviewLagHours(pr: PullRequestRow): number | null {
  if (pr.firstReviewAt == null) return null;
  const openedAt = new Date(pr.openedAt).getTime();
  const firstReviewAt = new Date(pr.firstReviewAt).getTime();
  return (firstReviewAt - openedAt) / 3_600_000;
}

export function LagChart({ prs }: Props) {
  const reviewed = prs
    .map((p) => {
      const lagHours = getReviewLagHours(p);
      if (lagHours == null) return null;
      return {
        name: `#${p.prNumber}`,
        author: p.author,
        title: p.title.length > 32 ? p.title.slice(0, 32) + "…" : p.title,
        lag: Math.round(lagHours * 10) / 10,
      };
    })
    .filter((p): p is { name: string; author: string; title: string; lag: number } => p != null)
    .sort((a, b) => b.lag - a.lag)
    .slice(0, 10);

  if (reviewed.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-[var(--text-subtle)]">
        No reviewed PRs yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, reviewed.length * 36)}>
      <BarChart
        data={reviewed}
        layout="vertical"
        barCategoryGap="25%"
        margin={{ left: 8, right: 32 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--chart-grid)"
          horizontal={false}
        />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: "var(--chart-axis)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}h`}
        />
        <YAxis
          dataKey="name"
          type="category"
          tick={{ fontSize: 11, fill: "var(--chart-axis)" }}
          tickLine={false}
          axisLine={false}
          width={36}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            border: "0.5px solid var(--chart-tooltip-border)",
            borderRadius: 8,
            background: "var(--chart-tooltip-bg)",
            boxShadow: "var(--shadow-none)",
          }}
          formatter={(value, _, entry) => {
            const raw = Array.isArray(value) ? value[0] : value;
            const lag = typeof raw === "number" ? raw : Number(raw ?? 0);
            const payload = (entry as { payload?: { title?: string } } | undefined)?.payload;
            return [`${lag}h`, payload?.title ?? "Review lag"];
          }}
          labelFormatter={(label: ReactNode) => {
            const labelText = typeof label === "string" ? label : String(label ?? "");
            const author = reviewed.find((r) => r.name === labelText)?.author;
            return author ? `PR ${labelText} · @${author}` : `PR ${labelText}`;
          }}
          cursor={{ fill: "var(--surface-overlay)" }}
        />
        <Bar dataKey="lag" name="Review lag" radius={[0, 3, 3, 0]}
          shape={<CustomBar />}

        >
          {/* {reviewed.map((entry) => (
            <Cell key={entry.name} fill={lagColor(entry.lag)} />
          ))} */}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

const CustomBar = (props: any) => {
  const { x, y, width, height, payload } = props;

  if (!payload) return null;

  return (
    <Rectangle
      x={Number(x)}
      y={Number(y)}
      width={Number(width)}
      height={Number(height)}
      radius={[0, 3, 3, 0]}
      fill={lagColor(payload.lag)}
    />
  );
};
