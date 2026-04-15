import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  const navLinkBase =
    "text-[13px] px-3 py-1.5 rounded-lg no-underline transition-colors";
  const navLinkDefault =
    "text-[var(--nav-text)] hover:text-[var(--nav-text-active)] hover:bg-[var(--nav-active-bg)]";
  const navLinkActive =
    "font-medium text-[var(--nav-text-active)] bg-[var(--nav-active-bg)]";

  return (
    <>
      <div className="min-h-screen bg-[var(--surface-page)] font-sans">
        <nav className="h-[var(--nav-height)] border-b border-[var(--nav-border)] bg-[var(--nav-bg)] flex items-center gap-6 px-4 sm:px-6 sticky top-0 z-10">
          <span className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
            ⚡ SprintBoard
          </span>

          <div className="flex items-center gap-1">
            <Link
              to="/"
              className={`${navLinkBase} ${navLinkDefault}`}
              activeProps={{ className: `${navLinkBase} ${navLinkActive}` }}
              activeOptions={{ exact: true }}
            >
              Dashboard
            </Link>
            <Link
              to="/standup"
              className={`${navLinkBase} ${navLinkDefault}`}
              activeProps={{ className: `${navLinkBase} ${navLinkActive}` }}
            >
              Standup
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] text-[var(--text-subtle)] hidden sm:block">
              workspace · 1
            </span>
          </div>
        </nav>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-7">
          <Outlet />
        </main>
      </div>
      <TanStackRouterDevtools />
    </>
  );
}
