import { config } from "@repo/config";
import Redis from "ioredis";

let instance: Redis | null = null;


export function getRedisClient(): Redis {

    if (instance) return instance;

    instance = new Redis(config.REDIS_URL, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true
    })

    instance.on("connect", () => console.log("[redis] connected"));
    instance.on("ready", () => console.log("[redis] ready"));
    instance.on("error", (err) => console.error("[redis] error", err.message));
    instance.on("close", () => console.warn("[redis] connection closed"));
    instance.on("reconnecting", () => console.log("[redis] reconnecting..."));

    return instance;

}

export async function disconnectRedis(): Promise<void> {
    if (instance) {
        await instance.quit();
        instance = null
    }
}


