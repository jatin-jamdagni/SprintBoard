import pino from "pino";
import { config } from "@repo/config";

const isDev = config.NODE_ENV === "development";

export const logger = pino({
  level: isDev ? "debug" : "info",
  ...(isDev
    ? {
        transport: {
          target:  "pino-pretty",
          options: {
            colorize:        true,
            translateTime:   "HH:MM:ss",
            ignore:          "pid,hostname",
            messageFormat:   "{msg}",
          },
        },
      }
    : {
        formatters: {
          level: (label: string) => ({ level: label }),
        },
        timestamp: pino.stdTimeFunctions.isoTime,
      }),
});

export function createChildLogger(context: Record<string, unknown>) {
  return logger.child(context);
}

export type Logger = typeof logger;