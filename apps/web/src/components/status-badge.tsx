// import type { PRStatus } from "@repo/types";

// const config: Record<
//     PRStatus,
//     { label: string; bg: string; color: string; darkBg: string; darkColor: string }
// > = {
//     open: { label: "open", bg: "#E1F5EE", color: "#085041", darkBg: "#04342C", darkColor: "#9FE1CB" },
//     merged: { label: "merged", bg: "#EEEDFE", color: "#3C3489", darkBg: "#26215C", darkColor: "#CECBF6" },
//     draft: { label: "draft", bg: "#F1EFE8", color: "#444441", darkBg: "#2C2C2A", darkColor: "#D3D1C7" },
//     closed: { label: "closed", bg: "#FCEBEB", color: "#791F1F", darkBg: "#501313", darkColor: "#F7C1C1" },
// };

// const STALE_HOURS = 48;

// type Props = {
//     status: PRStatus;
//     openedAt: Date;
//     reviewCount: number;
// };

// export function StatusBadge({ status, openedAt, reviewCount }: Props) {
//     const hoursOpen = (Date.now() - openedAt.getTime()) / 3_600_000;
//     const isStale = status === "open" && reviewCount === 0 && hoursOpen > STALE_HOURS;

//     const resolved = isStale ? "closed" : status;
//     const label = isStale ? "stale" : config[resolved]!.label;
//     const { bg, color } = config[resolved]!;

//     return (
//         <span
//             style={{
//                 display: "inline-flex",
//                 alignItems: "center",
//                 fontSize: 11,
//                 fontWeight: 500,
//                 padding: "2px 8px",
//                 borderRadius: 20,
//                 background: bg,
//                 color,
//                 marginLeft: 6,
//                 verticalAlign: "middle",
//             }}
//         >
//             {label}
//         </span>
//     );
// }

import type { PRStatus } from "@repo/types";

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