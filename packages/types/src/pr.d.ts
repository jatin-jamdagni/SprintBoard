import { z } from "zod";
export declare const PRStatusSchema: z.ZodEnum<{
    open: "open";
    merged: "merged";
    closed: "closed";
    draft: "draft";
}>;
export type PRStatus = z.infer<typeof PRStatusSchema>;
export declare const PullRequestSchema: z.ZodObject<{
    id: z.ZodNumber;
    workspaceId: z.ZodNumber;
    repo: z.ZodString;
    prNumber: z.ZodNumber;
    title: z.ZodString;
    author: z.ZodString;
    avatarUrl: z.ZodNullable<z.ZodURL>;
    status: z.ZodEnum<{
        open: "open";
        merged: "merged";
        closed: "closed";
        draft: "draft";
    }>;
    openedAt: z.ZodISODateTime;
    mergedAt: z.ZodNullable<z.ZodISODateTime>;
    firstReviewAt: z.ZodNullable<z.ZodISODateTime>;
    reviewCount: z.ZodNumber;
    reviewLagHours: z.ZodNullable<z.ZodNumber>;
    url: z.ZodURL;
    isDraft: z.ZodBoolean;
    additions: z.ZodNumber;
    deletions: z.ZodNumber;
}, z.core.$strip>;
export type PullRequest = z.infer<typeof PullRequestSchema>;
//# sourceMappingURL=pr.d.ts.map