import * as Sentry from "@sentry/bun";
import { config } from "@repo/config";

export function initSentry() {
  if (!config.SENTRY_DSN_API) {
    console.warn("[sentry] DSN not set — skipping init");
    return;
  }

  Sentry.init({
    dsn:         config.SENTRY_DSN_API,
    environment: config.SENTRY_ENVIRONMENT,
    tracesSampleRate: config.NODE_ENV === "production" ? 0.2 : 1.0,
    integrations: [
      Sentry.consoleIntegration(),
    ],
  });
}

export function captureException(
  err: unknown,
  context?: Record<string, unknown>
) {
  if (config.SENTRY_DSN_API) {
    Sentry.captureException(err, { extra: context });
  }
}

export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info"
) {
  if (config.SENTRY_DSN_API) {
    Sentry.captureMessage(message, level);
  }
}