import cors from "@elysiajs/cors";
import openapi from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { healthRoutes } from "./routes/health";
import { workspaceRoutes } from "./routes/workspaces";
import { prRoutes } from "./routes/pull-requests";
import { syncRoutes } from "./routes/sync";

const app = new Elysia()
  .use(cors({
    origin: ["https://localhost:5173"],
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
  .use(healthRoutes)
  .use(workspaceRoutes)
  .use(prRoutes)
  .use(syncRoutes)
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
  .listen(3000);


console.log(`🚀 API → http://localhost:${app.server?.port}`);
console.log(`📖 Docs → http://localhost:${app.server?.port}/openapi`);


export type App = typeof app;
