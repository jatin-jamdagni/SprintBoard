import { apiFetch } from "./http";

export type AuthUser = {
  id:          number;
  githubLogin: string;
  name:        string | null;
  avatarUrl:   string | null;
  workspaceId: number;
  role:        string;
};

export const authApi = {
  me: () =>
    apiFetch<AuthUser>("/auth/me"),

  logout: () =>
    apiFetch<{ loggedOut: boolean }>("/auth/logout", { method: "POST" }),

  loginUrl: () => "/auth/github",
};