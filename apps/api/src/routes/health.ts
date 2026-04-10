import { Elysia } from "elysia";
import type { ApiSuccess } from "@repo/types";

type HealthData = {
  status: "ok";
  version: string;
  timestamp: string;
  uptime: number;
};

const buildHealthData = (): HealthData => ({
  status: "ok",
  version: "0.0.1",
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
});

export const healthRoutes = new Elysia({
  prefix: "/api",
})
  .get("/", (): ApiSuccess<HealthData> => ({
    success: true,
    data: buildHealthData(),
  }))
  .get("/health", (): ApiSuccess<HealthData> => ({
    success: true,
    data: buildHealthData(),
  }))
  .get("/ping", (): ApiSuccess<string> => ({
    success: true,
    data: "pong",
  }));
