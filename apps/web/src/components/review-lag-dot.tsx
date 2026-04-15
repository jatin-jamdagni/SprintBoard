type Props = { lagHours: number | null; reviewCount: number };

export function ReviewLagDot({ lagHours, reviewCount }: Props) {
  if (reviewCount === 0 || lagHours === null) {
    return <span className="lag-dot lag-dot-crit" />;
  }
  if (lagHours <= 8) return <span className="lag-dot lag-dot-good" />;
  if (lagHours <= 24) return <span className="lag-dot lag-dot-warn" />;
  return <span className="lag-dot lag-dot-crit" />;
}
