import { DailySnapshotRow } from "@repo/types";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Props = {
  snapshots: DailySnapshotRow[];
};

const formateDate = (dateStr: string) => {
  const d = new Date(dateStr);

  return d.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
};

const VelocityChart = ({ snapshots }: Props) => {
  const data = [...snapshots]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((s) => ({
      date: formateDate(s.date),
      opened: s.prsOpened,
      merged: s.prsMerged,
    }));

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-[var(--text-subtle)]">
        No snapshot data yet. Sync PRs to generate snapshots.
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barCategoryGap="30%" barGap={3}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--chart-grid)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "var(--chart-axis)" }}
          tickLine={false}
          axisLine={false}
        />

        <YAxis
          tick={{ fontSize: 11, fill: "var(--chart-axis)" }}
          tickLine={false}
          axisLine={false}
          width={24}
        />

        <Tooltip
          contentStyle={{
            fontSize: 12,
            border: "0.5px solid var(--chart-tooltip-border)",
            borderRadius: 8,
            background: "var(--chart-tooltip-bg)",
            boxShadow: "var(--shadow-none)",
          }}
          cursor={{ fill: "var(--surface-overlay)" }}
        />

        <Legend
          iconType="square"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, color: "var(--text-subtle)" }}
        />

        <Bar dataKey="opened" name="Opened" fill="var(--chart-bar-secondary)" radius={[3, 3, 0, 0]} />
        <Bar dataKey="merged" name="Merged" fill="var(--chart-bar-primary)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default VelocityChart;
