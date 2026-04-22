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
import { captureException, initSentry } from "./lib/sentry";
import { logger } from "@repo/logger";




initSentry();
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
    const message = error instanceof Error ? error.message : String(error);
    if (message === "UNAUTHORIZED" || code === "UNAUTHORIZED") {
      set.status = 401;
      return { success: false, error: "Not authenticated" };
    }
    logger.error({ err: error, code }, "unhandled error");
    captureException(error, { code });

    if (code !== "NOT_FOUND") {
      captureException(error, { code });

    }
    set.status = code === "NOT_FOUND" ? 404 : 500;
    return { success: false as const, error: message };

  })
  .listen(env.API_PORT);

logger.info({
  port: app.server?.port,
  env: config.NODE_ENV,
  cron: config.NODE_ENV === "development" ? "every 1 min" : "every 5 min",
}, "SprintBoard API started");

process.on("SIGINT", async () => {
  logger.info("shutting down");
  await disconnectRedis();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  logger.info("shutting down");
  await disconnectRedis();
  process.exit(0);
});

process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "uncaught exception");
  captureException(err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.fatal({ reason }, "unhandled rejection");
  captureException(reason);
  process.exit(1);
});

export type App = typeof app;
