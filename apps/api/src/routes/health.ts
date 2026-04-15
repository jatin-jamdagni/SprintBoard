import { Elysia } from "elysia";
import { config } from "@repo/config";
import { wsBroker } from "../lib/ws-broker";
import { getRateLimitState } from "@repo/cache";
import type { ApiSuccess } from "@repo/types";

export const healthRoutes = new Elysia({ prefix: "/api/health" })
  .get("/", async (): Promise<ApiSuccess<object>> => {
    const rateLimit = await getRateLimitState();
    return {
      success: true,
      data: {
        status:    "ok",
        version:   "0.0.1",
        timestamp: new Date().toISOString(),
        uptime:    Math.floor(process.uptime()),
        env:       config.NODE_ENV,
        cron:      config.NODE_ENV === "development" ? "every 1 min" : "every 5 min",
        ws:        wsBroker.stats(),
        rateLimit: rateLimit ?? { status: "unknown" },
      },
    };
  })
  .get("/ping", (): ApiSuccess<string> => ({
    success: true,
    data: "pong",
  }));