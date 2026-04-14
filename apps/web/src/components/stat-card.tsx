type Props = {
  label: string;
  value: string | number;
  sub?: string;
};

export function StatCard({ label, value, sub }: Props) {
  return (
    <div
      style={{
        background: "var(--color-background-secondary)",
        borderRadius: 8,
        padding: "12px 14px",
      }}
    >
      <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 500, color: "var(--color-text-primary)" }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginTop: 2 }}>
          {sub}
        </div>
      )}
    </div>
  );
}