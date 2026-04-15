type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function ChartSection({ title, description, children }: Props) {
  return (
    <div className="card p-4">
      <div className="mb-4">
        <h2 className="text-sm font-medium text-[var(--text-primary)]">
          {title}
        </h2>
        {description && (
          <p className="text-[11px] text-[var(--text-subtle)] mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
