import {
  createRootRoute,

  Outlet,
  Navigate,
  Link
} from "@tanstack/react-router";
import { useAuth } from "../context/auth-context";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { authApi } from "@repo/api-client";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  const auth = useAuth();
  const qc = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      qc.clear();
      window.location.href = "/login";
    },
  });

  // ── loading splash ────────────────────────────────────────
  if (auth.status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm ">
          <span className="w-4 h-4 rounded-full border-2    animate-spin" />
          Loading…
        </div>
      </div>
    );
  }

  // ── unauthenticated — allow /login, redirect everything else ─
  if (auth.status === "unauthenticated") {
    const path = window.location.pathname;
    if (path === "/login") return <Outlet />;
    return <Navigate to="/login" />;
  }

  // ── authenticated shell ───────────────────────────────────
  const { user } = auth;

  return (

    <>
      <div className="min-h-screen bg-surface-page">

        {/* ── Nav ─────────────────────────────────────────────── */}
        <nav className="
        h-12 sticky top-0 z-10
        bg-nav-bg
        border-b border-nav-border
        flex items-center gap-1 px-5
      ">
          {/* brand */}
          <span className="text-sm font-semibold text-text-primary mr-4">
            ⚡ SprintBoard
          </span>

          {/* nav links */}
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="text-[13px] px-3 py-1.5 rounded-lg text-nav-text hover:bg-nav-active-bg hover:text-nav-text-active no-underline transition-colors"
            activeProps={{
              className:
                "text-[13px] px-3 py-1.5 rounded-lg font-medium bg-nav-active-bg text-nav-text-active no-underline",
            }}
          >
            Dashboard
          </Link>

          <Link
            to="/standup"
            className="text-[13px] px-3 py-1.5 rounded-lg text-nav-text hover:bg-nav-active-bg hover:text-nav-text-active no-underline transition-colors"
            activeProps={{
              className:
                "text-[13px] px-3 py-1.5 rounded-lg font-medium bg-nav-active-bg text-nav-text-active no-underline",
            }}
          >
            Standup
          </Link>

          {/* right side */}
          <div className="ml-auto flex items-center gap-3">
            {/* workspace badge */}
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-text-muted bg-surface-subtle px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-status-success-dot" />
              workspace {user.workspaceId}
            </span>

            {/* avatar */}
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.githubLogin}
                className="w-6 h-6 rounded-full ring-1 ring-border-default"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-brand-light flex items-center justify-center text-[10px] font-medium text-brand">
                {user.githubLogin.slice(0, 2).toUpperCase()}
              </div>
            )}

            <span className="text-[13px] text-text-muted">
              @{user.githubLogin}
            </span>

            <button
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="text-[11px] text-text-muted hover:text-text-primary transition-colors disabled:opacity-50"
            >
              {logoutMutation.isPending ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </nav>

        {/* ── Page content ────────────────────────────────────── */}
        <main className="max-w-5xl mx-auto px-6 py-7">
          <Outlet />
        </main>
      </div>

      <TanStackRouterDevtools />
    </>
  );
}