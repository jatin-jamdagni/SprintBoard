import { getRedisClient } from "./client";




export type CacheOptions = {
    ttlSeconds: number;

}

export async function cacheGet<T>(key: string): Promise<T | null> {
    try {
        const client = getRedisClient();
        const raw = await client.get(key);
        if (!raw) {
            return null;
        }

        return JSON.parse(raw) as T
    } catch (err) {

        console.warn(`[cache] get failed key=${key}`, err);
        return null

    }
}


export async function cacheSet<T>(
    key: string,
    value: T,
    options: CacheOptions
): Promise<void> {

    try {
        const client = getRedisClient();
        await client.set(key, JSON.stringify(value), "EX", options.ttlSeconds)

    } catch (err) {

        console.warn(`[cache] set failed key=${key}`, err);

    }
}

export async function cacheDel(key: string): Promise<void> {
    try {

        const client = getRedisClient();
        await client.del(key);
    } catch (err) {
        console.warn(`[cache] del failed key=${key}`, err);

    }
}



export async function cacheGetOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions
): Promise<T> {
    const cached = await cacheGet<T>(key);
    if (cached !== null) {
        console.log(`[cache] hit key=${key}`);
        return cached;
    }

    console.log(`[cache] miss key=${key}`);
    const fresh = await fetcher();
    await cacheSet(key, fresh, options);
    return fresh;
}
export async function cacheInvalidatePattern(pattern: string): Promise<void> {
    try {
        const client = getRedisClient();
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
            await client.del(...keys);
            console.log(`[cache] invalidated ${keys.length} key(s) matching ${pattern}`);
        }
    } catch (err) {
        console.warn(`[cache] invalidate failed pattern=${pattern}`, err);
    }
}
