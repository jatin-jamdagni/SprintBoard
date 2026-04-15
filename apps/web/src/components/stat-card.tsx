type Props = {
  label: string;
  value: string | number;
  sub?: string;
};

export function StatCard({ label, value, sub }: Props) {
  return (
    <div className="stat-card">
      <p className="text-[11px] text-[var(--text-subtle)] mb-1">{label}</p>
      <p className="text-xl font-semibold text-[var(--text-primary)]">{value}</p>
      {sub && <p className="text-[10px] text-[var(--text-subtle)] mt-0.5">{sub}</p>}
    </div>
  );
}
