function SkeletonLine({ width = "100%", height = 12 }: { width?: string; height?: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 4,
        background: "var(--color-background-secondary)",
      }}
    />
  );
}

function SkeletonCard() {
  return (
    <div
      style={{
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 10,
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", gap: 10 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "var(--color-background-secondary)",
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <SkeletonLine width="70%" height={13} />
          <SkeletonLine width="40%" height={10} />
        </div>
      </div>
      <SkeletonLine height={1} />
      <div style={{ display: "flex", gap: 12 }}>
        <SkeletonLine width="25%" height={10} />
        <SkeletonLine width="15%" height={10} />
      </div>
    </div>
  );
}

export function PRListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}