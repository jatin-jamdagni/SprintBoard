import { z } from "zod";

export const SprintSummarySchema = z.object({
  id: z.number(),
  workspaceId: z.number(),
  generatedAt: z.iso.datetime(),
  content: z.string().min(1),
  prCount: z.number().int().min(0),
  mergedCount: z.number().int().min(0),
});
export type SprintSummary = z.infer<typeof SprintSummarySchema>;