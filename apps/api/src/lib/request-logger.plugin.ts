import { createChildLogger } from "@repo/logger";
import Elysia from "elysia";
import path from "node:path";







const log = createChildLogger({
    module: "http"
})

export const requestLoggerPlugin = new Elysia({ name: "request-logger" })
    .onRequest(({ request }) => {

        const url = new URL(request.url);
        log.info({
            method: request.method,
            path: url.pathname,
            msg: "-> request"
        })

    })
    .onAfterResponse(({ request, responseValue, set }) => {
        const url = new URL(request.url);
        const status = typeof set.status === "number" ? set.status : 200;
        const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";

        log[level]({
            method: request.method,
            path: url.pathname,
            status,
            msg: "<- response"
        })
    })