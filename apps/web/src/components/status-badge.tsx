import { PRStatus } from "@repo/types";

 
const STALE_HOURS = 48;

type Props = {
  status: PRStatus;
  openedAt: Date;
  reviewCount: number;
};

export function StatusBadge({ status, openedAt, reviewCount }: Props) {
  const hoursOpen = (Date.now() - openedAt.getTime()) / 3_600_000;
  const isStale = status === "open" && reviewCount === 0 && hoursOpen > STALE_HOURS;
  const key = isStale ? "stale" : status;

  return (
    <span className={`badge badge-${key} ml-1.5 align-middle`}>
      {key}
    </span>
  );
}
