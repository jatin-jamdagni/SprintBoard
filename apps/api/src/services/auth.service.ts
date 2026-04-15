import { randomBytes } from "crypto";
import { config } from "@repo/config";
import {
  upsertUser,
  createSession,
  createWorkspace,
  getAllWorkspaces,
} from "@repo/db";

const GITHUB_OAUTH_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_USER_URL = "https://api.github.com/user";

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

type BuildAuthorizationUrlInput = {
  state: string;
  redirectUri: string;
};

export function buildAuthorizationUrl({
  state,
  redirectUri,
}: BuildAuthorizationUrlInput): string {
  const params = new URLSearchParams({
    client_id: config.GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: "read:user user:email repo read:org",
    state,
  });
  return `${GITHUB_OAUTH_URL}?${params.toString()}`;
}

export function generateState(): string {
  return randomBytes(16).toString("hex");
}

export function generateSessionId(): string {
  return randomBytes(32).toString("hex");
}

export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
  const res = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: config.GITHUB_CLIENT_ID,
      client_secret: config.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
    }),
  });

  const data = await res.json() as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };
  if (!res.ok || !data.access_token) {
    throw new Error(
      `GitHub token exchange failed: ${data.error_description ?? data.error ?? `HTTP ${res.status}`}`
    );
  }
  return data.access_token;
}

type GitHubUser = {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  email: string | null;
};

export async function fetchGitHubUser(accessToken: string): Promise<GitHubUser> {
  const res = await fetch(GITHUB_USER_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });
  if (!res.ok) throw new Error(`GitHub user fetch failed: ${res.status}`);
  return res.json() as Promise<GitHubUser>;
}

export async function findOrCreateWorkspaceForUser(
  githubLogin: string,
  githubOrg: string
): Promise<number> {
  const all = await getAllWorkspaces();
  const existing = all.find(
    (ws) =>
      ws.githubOrg === githubOrg ||
      ws.githubOrg === githubLogin
  );
  if (existing) return existing.id;

  const created = await createWorkspace({
    name: `${githubLogin}'s workspace`,
    githubOrg: githubLogin,
    githubRepo: config.GITHUB_REPO,
  });
  return created.id;
}

export async function createUserSession(
  accessToken: string,
  githubUser: GitHubUser
): Promise<{ sessionId: string; expiresAt: Date; workspaceId: number }> {
  const workspaceId = await findOrCreateWorkspaceForUser(
    githubUser.login,
    config.GITHUB_ORG
  );

  const user = await upsertUser({
    workspaceId,
    githubId: String(githubUser.id),
    githubLogin: githubUser.login,
    name: githubUser.name,
    avatarUrl: githubUser.avatar_url,
    email: githubUser.email,
    accessToken,
    role: "owner",
  });

  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await createSession({
    id: sessionId,
    userId: user.id,
    workspaceId,
    expiresAt,
  });

  return { sessionId, expiresAt, workspaceId };
}
