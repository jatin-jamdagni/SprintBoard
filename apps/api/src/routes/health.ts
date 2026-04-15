import { Elysia } from "elysia";
import { config } from "@repo/config";
import type { ApiSuccess } from "@repo/types";

type HealthData = {
  status: "ok";
  version: string;
  timestamp: string;
  uptime: number;
  env: string;
  cron: string;
};

export const healthRoutes = new Elysia({ prefix: "/api/health" })
  .get("/", (): ApiSuccess<HealthData> => ({
    success: true,
    data: {
      status: "ok",
      version: "0.0.1",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      env: config.NODE_ENV,
      cron: config.NODE_ENV === "development" ? "every 1 min" : "every 5 min",
    },
  }))
  .get("/ping", (): ApiSuccess<string> => ({
    success: true,
    data: "pong",
  }));