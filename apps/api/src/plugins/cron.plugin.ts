import { Elysia } from "elysia";
import type { AnyElysia } from "elysia";
import { cron } from "@elysiajs/cron";
import { config } from "@repo/config";
import { syncAllWorkspaces } from "../services/sync.service";
import { computeSnapshotsForAllWorkspaces } from "../services/snapshot.service";

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
        console.log(`[cron:sync] tick — ${new Date().toISOString()}`);
        try {
          const results = await syncAllWorkspaces();
          const total = results.reduce((sum, result) => sum + result.synced, 0);
          console.log(`[cron] done — ${total} PRs upserted across ${results.length} workspace(s)`);
        } catch (err) {
          console.error("[cron:sync] error —", err);
        }
      },
    })
  )

  .use(
    cron({
      name: "compute-snapshots",
      pattern: snapshotPattern,
      async run() {
        console.log(`[cron:snapshots] tick — ${new Date().toISOString()}`);

        try {
          await computeSnapshotsForAllWorkspaces();

        } catch (err) {
          console.error("[cron:snapshots] error —", err);

        }

      }
    })
  )
