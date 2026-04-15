import { getSession, getUserById } from "@repo/db";
import { SessionRow, UserRow } from "@repo/types"

export type SessionContext = {
    user: UserRow;
    session: SessionRow;
}




export async function resolveSession(
    cookieHeader: string | null
): Promise<SessionContext | null> {
    if (!cookieHeader) return null;

    const sessionId = parseCookie(cookieHeader, "sb_session");
    if (!sessionId) return null;

    const session = await getSession(sessionId);
    if (!session) return null;

    const user = await getUserById(session.userId);
    if (!user) return null;

    return { user, session };
}

function parseCookie(header: string, name: string): string | null {
    const match = header
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith(`${name}=`));
    return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

export function buildSessionCookie(
    sessionId: string,
    expiresAt: Date,
    isSecure: boolean
): string {
    const parts = [
        `sb_session=${encodeURIComponent(sessionId)}`,
        `HttpOnly`,
        `SameSite=Lax`,
        `Path=/`,
        `Expires=${expiresAt.toUTCString()}`,
    ];
    if (isSecure) parts.push("Secure");
    return parts.join("; ");
}

export function buildClearSessionCookie(): string {
    return "sb_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0";
}