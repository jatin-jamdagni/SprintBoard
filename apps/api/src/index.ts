import cors from "@elysiajs/cors";
import openapi from "@elysiajs/openapi";
import { env } from "@repo/config/server";
import { Elysia } from "elysia";
import { healthRoutes } from "./routes/health";
import { authRoutes } from "./routes/auth";
import { workspaceRoutes } from "./routes/workspaces";
import { prRoutes } from "./routes/pull-requests";
import { syncRoutes } from "./routes/sync";
import { summaryRoutes } from "./routes/summaries";
import { webhookRoutes } from "./routes/webhooks";
import { cronPlugin } from "./plugins/cron.plugin";
import { config } from "@repo/config";
import { wsRoutes } from "./routes/ws";

import { getRedisClient, disconnectRedis } from "@repo/cache";





getRedisClient();

const app = new Elysia()
  .use(cors({
    origin: [env.API_CORS_ORIGIN],
    credentials: true
  }))
  .use(openapi({
    documentation: {
      info: {
        title: "SprintBoard API",
        version: "0.0.1"
      }
    }
  })
  )
  .use(cronPlugin)
  .use(healthRoutes)
  .use(authRoutes)
  .use(workspaceRoutes)
  .use(prRoutes)
  .use(syncRoutes)
  .use(summaryRoutes)
  .use(webhookRoutes)
  .use(wsRoutes)

  .onError(({ error, code, set }) => {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      set.status = 403;
      return {
        success: false as const,
        error: "Forbidden",
      };
    }

    if (code !== "NOT_FOUND") {
      console.error(`[${code}]`, error);
    }

    set.status = code === "NOT_FOUND" ? 404 : 500;
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Unknown error",

    };
  })
  .listen(env.API_PORT);


console.log(`🚀 API → http://localhost:${app.server?.port}`);
console.log(`🔌 WS  → ws://localhost:${app.server?.port}/ws`);

console.log(`📖 Docs → http://localhost:${app.server?.port}/openapi`);
console.log(`⏰ Cron → ${config.NODE_ENV === "development" ? "every 1 min" : "every 5 min"}`);
console.log(`🌍 Env  → ${config.NODE_ENV}`);



process.on("SIGINT", async () => { await disconnectRedis(); process.exit(0); });
process.on("SIGTERM", async () => { await disconnectRedis(); process.exit(0); });

export type App = typeof app;
