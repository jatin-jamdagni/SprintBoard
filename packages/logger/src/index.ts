import pino from "pino";
import pinoPretty from "pino-pretty";
import { config } from "@repo/config";

const isDev = config.NODE_ENV === "development";

const baseOptions = {
  level: isDev ? "debug" : "info",
  ...(isDev
    ? {}
    : {
        formatters: {
          level: (label: string) => ({ level: label }),
        },
        timestamp: pino.stdTimeFunctions.isoTime,
      }),
};

const devStream = isDev
  ? pinoPretty({
      colorize: true,
      translateTime: "HH:MM:ss",
      ignore: "pid,hostname",
      messageFormat: "{msg}",
    })
  : undefined;

export const logger = pino(baseOptions, devStream);

export function createChildLogger(context: Record<string, unknown>) {
  return logger.child(context);
}

export type Logger = typeof logger;
