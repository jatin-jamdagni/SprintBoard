import { z } from "zod";

export const WSEventTypeSchema = z.enum([
  "pr.upserted",
  "pr.synced",
  "summary.generated",
  "ping",
]);
export type WSEventType = z.infer<typeof WSEventTypeSchema>;

export const WSMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("pr.upserted"),
    workspaceId: z.number(),
    prNumber: z.number(),
    repo: z.string(),
  }),
  z.object({
    type: z.literal("pr.synced"),
    workspaceId: z.number(),
    synced: z.number(),
  }),
  z.object({
    type: z.literal("summary.generated"),
    workspaceId: z.number(),
    summaryId: z.number(),
  }),
  z.object({
    type: z.literal("ping"),
    ts: z.number(),
  }),
]);

export type WSMessage = z.infer<typeof WSMessageSchema>;