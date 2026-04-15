import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "../context/auth-context";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const auth = useAuth();

  if (auth.status === "loading") {
    return (
      <div className="min-h-screen bg-surface-page flex items-center justify-center">
        <span className="w-5 h-5 rounded-full border-2 border-border-default border-t-brand animate-spin" />
      </div>
    );
  }

  if (auth.status === "authenticated") {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-surface-page flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-surface-card border border-border-default rounded-2xl p-8 text-center">

          <div className="text-2xl font-semibold text-text-primary mb-1">
            ⚡ SprintBoard
          </div>
          <p className="text-sm text-text-muted mb-8 leading-relaxed">
            Engineering team shipping dashboard.
            <br />
            Sign in to see your PRs.
          </p>


          <a
            href={auth.githubLoginUrl}
            onClick={(e) => {
              e.preventDefault();
              auth.startGithubLogin();
            }}
            className="flex items-center justify-center gap-2.5 w-full py-2.5 px-4 rounded-lg bg-text-primary text-surface-page text-sm font-medium hover:opacity-90 transition-colors no-underline"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Continue with GitHub
          </a>

          <p className="text-[11px] text-text-muted mt-5">
            Read-only access to your profile and repos.
            <br />
            We never push code or open PRs on your behalf.
          </p>
        </div>

        <p className="text-center text-[11px] text-text-muted mt-4">
          SprintBoard · open source
        </p>
      </div>
    </div>
  );
}
