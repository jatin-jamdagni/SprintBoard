import { Elysia } from "elysia";
import { config } from "@repo/config";
import {
    buildAuthorizationUrl,
    generateState,
    exchangeCodeForToken,
    fetchGitHubUser,
    createUserSession,
} from "../services/auth.service";
import {
    resolveSession,
    buildSessionCookie,
    buildClearSessionCookie,
} from "../lib/session";
import { invalidateSession } from "@repo/db";

function formatAuthError(err: unknown): string {
    const error = err instanceof Error ? err : new Error("Auth failed");
    const cause = (error as { cause?: unknown }).cause;
    const causeMessage =
        typeof cause === "object" &&
            cause !== null &&
            "message" in cause &&
            typeof (cause as { message: unknown }).message === "string"
            ? (cause as { message: string }).message
            : null;

    const causeCode =
        typeof cause === "object" &&
            cause !== null &&
            "code" in cause &&
            typeof (cause as { code: unknown }).code === "string"
            ? (cause as { code: string }).code
            : null;

    if (causeCode === "42P01" || causeCode === "42703") {
        return "Database schema is outdated for auth tables. Run `bun --filter @repo/db db:migrate` and restart API.";
    }

    if (causeCode === "23503") {
        return `Database foreign-key constraint failed during login (${causeCode}). ${causeMessage ?? "Check workspace/user relations."}`;
    }

    if (causeMessage) return causeMessage;
    return error.message || "Auth failed";
}

function buildOAuthStateCookie(state: string, isSecure: boolean): string {
    const parts = [
        `sb_oauth_state=${encodeURIComponent(state)}`,
        "HttpOnly",
        "SameSite=Lax",
        "Path=/",
        "Max-Age=600",
    ];
    if (isSecure) parts.push("Secure");
    return parts.join("; ");
}

function clearOAuthStateCookie(isSecure: boolean): string {
    const parts = [
        "sb_oauth_state=",
        "HttpOnly",
        "SameSite=Lax",
        "Path=/",
        "Max-Age=0",
    ];
    if (isSecure) parts.push("Secure");
    return parts.join("; ");
}

export const authRoutes = new Elysia({ prefix: "/auth" })

    .get("/github", ({ request, set }) => {
        const state = generateState();
        const callbackUrl = new URL("/auth/callback", request.url).toString();
        const url = buildAuthorizationUrl({ state, redirectUri: callbackUrl });
        const isSecure = config.NODE_ENV === "production";

        set.headers["Set-Cookie"] = buildOAuthStateCookie(state, isSecure);
        set.status = 302;
        set.headers["Location"] = url;
    })

    .get("/callback", async ({ query, request, set }) => {
        const isSecure = config.NODE_ENV === "production";
        const { code, state } = query as { code?: string; state?: string };

        if (!code) {
            set.status = 400;
            set.headers["Set-Cookie"] = clearOAuthStateCookie(isSecure);
            return { success: false, error: "Missing code" };
        }

        const cookieHeader = request.headers.get("cookie");
        const storedState = cookieHeader
            ? cookieHeader
                .split(";")
                .map((c) => c.trim())
                .find((c) => c.startsWith("sb_oauth_state="))
                ?.split("=")[1]
            : null;

        if (!storedState || decodeURIComponent(storedState) !== state) {
            set.status = 400;
            set.headers["Set-Cookie"] = clearOAuthStateCookie(isSecure);
            return { success: false, error: "Invalid state — possible CSRF" };
        }

        try {
            const callbackUrl = new URL("/auth/callback", request.url).toString();
            const accessToken = await exchangeCodeForToken(code, callbackUrl);
            const githubUser = await fetchGitHubUser(accessToken);
            const { sessionId, expiresAt } = await createUserSession(accessToken, githubUser);

            set.headers["Set-Cookie"] = buildSessionCookie(sessionId, expiresAt, isSecure);
            set.status = 302;
            set.headers["Location"] = config.APP_URL;
        } catch (err) {
            console.error("[auth] callback error", err);
            set.status = 500;
            set.headers["Set-Cookie"] = clearOAuthStateCookie(isSecure);
            return {
                success: false,
                error: formatAuthError(err),
            };
        }
    })

    .get("/me", async ({ request, set }) => {
        const ctx = await resolveSession(request.headers.get("cookie"));
        if (!ctx) {
            set.status = 401;
            return { success: false, error: "Not authenticated" }
        }

        return {
            success: true,
            data: {
                id: ctx.user.id,
                githubLogin: ctx.user.githubLogin,
                name: ctx.user.name,
                avatarUrl: ctx.user.avatarUrl,
                workspaceId: ctx.user.workspaceId,
                role: ctx.user.role,
            },
        };
    })

    .post("/logout", async ({ request, set }) => {
        const cookieHeader = request.headers.get("cookie");
        const ctx = await resolveSession(cookieHeader);

        if (ctx) {
            await invalidateSession(ctx.session.id);
        }

        set.headers["Set-Cookie"] = buildClearSessionCookie();
        return { success: true, data: { loggedOut: true } };
    });
