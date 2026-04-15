import Elysia from "elysia";
import { resolveSession } from "../lib/session";
import type { SessionContext } from "../lib/session";

export const authPlugin = new Elysia({ name: "auth-plugin" })
  .derive({ as: "global" }, async ({ request }): Promise<{ auth: SessionContext | null }> => {
    const ctx = await resolveSession(request.headers.get("cookie"));
    return { auth: ctx };
  });

export function requireAuth(auth: SessionContext | null): asserts auth is SessionContext {
  if (!auth) throw new Error("UNAUTHORIZED");
}