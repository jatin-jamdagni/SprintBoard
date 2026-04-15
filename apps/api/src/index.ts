import cors from "@elysiajs/cors";
import openapi from "@elysiajs/openapi";
import { env } from "@repo/config/server";
import { Elysia } from "elysia";
import { healthRoutes } from "./routes/health";
import { workspaceRoutes } from "./routes/workspaces";
import { prRoutes } from "./routes/pull-requests";
import { syncRoutes } from "./routes/sync";
import { summaryRoutes } from "./routes/summaries";
import { webhookRoutes } from "./routes/webhooks";
import { cronPlugin } from "./plugins/cron.plugin";
import { config } from "@repo/config";

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
  .use(workspaceRoutes)
  .use(prRoutes)
  .use(syncRoutes)
  .use(summaryRoutes)
  .use(webhookRoutes)
  .onError(({ error, code, set }) => {
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
console.log(`📖 Docs → http://localhost:${app.server?.port}/openapi`);
console.log(`⏰ Cron     → ${config.NODE_ENV === "development" ? "every 1 min" : "every 5 min"}`);
console.log(`🌍 Env      → ${config.NODE_ENV}`);

export type App = typeof app;
