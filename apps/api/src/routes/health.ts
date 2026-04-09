import { Elysia } from "elysia"
import type { ApiSuccess } from "@repo/types";




type HealthData = {
    status: "ok";
    version: string;
    timestamp: string;
    uptime: number;
}


export const healthRoutes = new Elysia({
    prefix: "/api"
})
    .get("/", (): ApiSuccess<HealthData> => ({
        success: true,
        data: {
            status: "ok",
            version: "0.0.1",
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        }

    }))

    .get("/ping", (): ApiSuccess<string> => ({
        success: true,
        data: "pong"
    }))

