import { z } from "zod";

export const PRStatusSchema = z.enum(["open", "merged", "closed", "draft"]);
export type PRStatus = z.infer<typeof PRStatusSchema>;

export const PullRequestSchema = z.object({
  id: z.number(),
  workspaceId: z.number(),
  repo: z.string(),
  prNumber: z.number(),
  title: z.string(),
  author: z.string(),
  avatarUrl: z.url().nullable(),
  status: PRStatusSchema,
  openedAt: z.iso.datetime(),
  mergedAt: z.iso.datetime().nullable(),
  firstReviewAt: z.iso.datetime().nullable(),
  reviewCount: z.number().int().min(0),
  reviewLagHours: z.number().nullable(),
  url: z.url(),
  isDraft: z.boolean(),
  additions: z.number().int().min(0),
  deletions: z.number().int().min(0),
});
export type PullRequest = z.infer<typeof PullRequestSchema>;