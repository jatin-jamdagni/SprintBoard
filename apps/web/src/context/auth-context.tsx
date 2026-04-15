import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { authApi, ApiError } from "@repo/api-client";
import type { AuthUser } from "@repo/api-client";

type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; user: AuthUser }
  | { status: "unauthenticated" };

type AuthContextValue = AuthState & {
  githubLoginUrl: string;
  startGithubLogin: () => void;
};

function resolveGithubLoginUrl(): string {
  if (typeof window === "undefined") return "/auth/github";

  const { protocol, hostname, port } = window.location;
  if (port === "5173") return `${protocol}//${hostname}:3000/auth/github`;

  return "/auth/github";
}

const AuthContext = createContext<AuthContextValue>({
  status: "loading",
  githubLoginUrl: "/auth/github",
  startGithubLogin: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: ["auth-me"],
    queryFn:  () => authApi.me(),
    retry: (failureCount, err) => {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        return false;
      }

      return failureCount < 1;
    },
    staleTime: 5 * 60 * 1000,
  });

  
  const state: AuthState = isLoading
    ? { status: "loading" }
    : data
    ? { status: "authenticated", user: data }
    : { status: "unauthenticated" };

  const githubLoginUrl = resolveGithubLoginUrl();
  const startGithubLogin = () => {
    if (typeof window === "undefined") return;
    window.location.assign(githubLoginUrl);
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        githubLoginUrl,
        startGithubLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
