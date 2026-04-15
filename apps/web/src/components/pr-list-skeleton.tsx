function SkeletonCard() {
  return (
    <div className="card p-3.5 animate-pulse">
      <div className="flex gap-2.5 mb-3">
        <div className="w-7 h-7 rounded-full bg-surface-muted shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-surface-muted rounded w-2/3" />
          <div className="h-2.5 bg-surface-muted rounded w-1/3" />
        </div>
      </div>
      <div className="border-t border-border-subtle pt-2 flex gap-3">
        <div className="h-2.5 bg-surface-muted rounded w-1/4" />
        <div className="h-2.5 bg-surface-muted rounded w-1/6" />
      </div>
    </div>
  );
}

export function PRListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
