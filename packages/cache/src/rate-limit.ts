import { cacheGet, cacheSet } from "./helpers";
import { CacheKeys, CacheTTL } from "./keys";

export type RateLimitState = {
    limit: number;
    remaining: number;
    resetAt: string;
    used: number;
    checkedAt: string;
    isThrottled: boolean;
};

const THROTTLE_THRESHOLD = 100;

export async function saveRateLimitState(state: Omit<RateLimitState, "isThrottled" | "checkedAt">): Promise<void> {
    const full: RateLimitState = {
        ...state,
        checkedAt: new Date().toISOString(),
        isThrottled: state.remaining < THROTTLE_THRESHOLD,
    };
    await cacheSet(CacheKeys.rateLimit(), full, { ttlSeconds: CacheTTL.RATE_LIMIT });
}

export async function getRateLimitState(): Promise<RateLimitState | null> {
    return cacheGet<RateLimitState>(CacheKeys.rateLimit());
}

export async function isRateLimited(): Promise<boolean> {
    const state = await getRateLimitState();
    if (!state) return false;

    if (state.remaining < THROTTLE_THRESHOLD) {
        const resetAt = new Date(state.resetAt).getTime();
        if (Date.now() < resetAt) {
            console.warn(`[rate-limit] throttled — ${state.remaining} remaining, resets at ${state.resetAt}`);
            return true;
        }
    }

    return false;
}

export function updateRateLimitFromHeaders(headers: Record<string, string | undefined>): void {
    const remaining = headers["x-ratelimit-remaining"];
    const limit = headers["x-ratelimit-limit"];
    const reset = headers["x-ratelimit-reset"];
    const used = headers["x-ratelimit-used"];

    if (remaining && limit && reset) {
        saveRateLimitState({
            remaining: Number(remaining),
            limit: Number(limit),
            resetAt: new Date(Number(reset) * 1000).toISOString(),
            used: used ? Number(used) : 0,
        }).catch(console.error);
    }
}