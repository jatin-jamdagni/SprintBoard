import { Elysia } from "elysia";
import type { AnyElysia } from "elysia";
import { cron } from "@elysiajs/cron";
import { config } from "@repo/config";
import { syncAllWorkspaces } from "../services/sync.service";

const EVERY_5_MINUTES = "*/5 * * * *";
const EVERY_MINUTE    = "* * * * *";

const cronExpression =
  config.NODE_ENV === "development" ? EVERY_MINUTE : EVERY_5_MINUTES;

export const cronPlugin: AnyElysia = new Elysia({ name: "cron-plugin" }).use(
  cron({
    name: "sync-prs",
    pattern: cronExpression,
    async run() {
      console.log(`[cron] tick — ${new Date().toISOString()}`);
      try {
        const { succeeded, failed } = await syncAllWorkspaces();
        const total = succeeded.reduce((sum, result) => sum + result.synced, 0);
        console.log(
          `[cron] done — ${total} PRs upserted across ${succeeded.length} workspace(s); ${failed.length} failed`,
        );
      } catch (err) {
        console.error("[cron] error —", err);
      }
    },
  })
);
