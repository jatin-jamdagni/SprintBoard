import { Elysia } from "elysia";
import type { AnyElysia } from "elysia";
import { cron } from "@elysiajs/cron";
import { config } from "@repo/config";
import { logger } from "@repo/logger";
import { syncAllWorkspaces } from "../services/sync.service";
import { computeSnapshotsForAllWorkspaces } from "../services/snapshot.service";

const log = logger.child({ module: "cron" });

const EVERY_5_MINUTES = "*/5 * * * *";
const EVERY_MINUTE = "* * * * *";
const NIGHTLY_1AM = "0 1 * * *";

const syncPattern = config.NODE_ENV === "development" ? EVERY_MINUTE : EVERY_5_MINUTES;
const snapshotPattern = config.NODE_ENV === "development" ? EVERY_MINUTE : NIGHTLY_1AM;

// const cronExpression =
//   config.NODE_ENV === "development" ? EVERY_MINUTE : EVERY_5_MINUTES;

export const cronPlugin: AnyElysia = new Elysia({ name: "cron-plugin" })
  .use(
    cron({
      name: "sync-prs",
      pattern: syncPattern,
      async run() {
        log.info("sync tick");
        try {
          const results = await syncAllWorkspaces();
          const total = results.reduce((sum, result) => sum + result.synced, 0);
          log.info({ total, workspaces: results.length }, "sync done");
        } catch (err) {
          log.error({ err }, "sync cron error");
        }
      },
    })
  )

  .use(
    cron({
      name: "compute-snapshots",
      pattern: snapshotPattern,
      async run() {
        log.info("snapshots tick");

        try {
          await computeSnapshotsForAllWorkspaces();

        } catch (err) {
          log.error({ err }, "snapshots cron error");

        }

      }
    })
  )
