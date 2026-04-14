type Props = { lagHours: number | null; reviewCount: number };

export function ReviewLagDot({ lagHours, reviewCount }: Props) {
  if (reviewCount === 0 || lagHours === null) {
    return <Dot color="#ef4444" />;
  }
  if (lagHours <= 8) return <Dot color="#22c55e" />;
  if (lagHours <= 24) return <Dot color="#f59e0b" />;
  return <Dot color="#ef4444" />;
}

function Dot({ color }: { color: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
      }}
    />
  );
}