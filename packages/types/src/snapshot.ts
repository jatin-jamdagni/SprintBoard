import { z } from "zod";

export const DailySnapshotSchema = z.object({
  id: z.number(),
  workspaceId: z.number(),
  date: z.iso.date(),
  prsOpened: z.number().int().min(0),
  prsMerged: z.number().int().min(0),
  avgReviewLagHours: z.number().nullable(),
});
export type DailySnapshot = z.infer<typeof DailySnapshotSchema>;