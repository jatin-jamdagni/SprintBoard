import { z } from "zod";
export declare const SprintSummarySchema: z.ZodObject<{
    id: z.ZodNumber;
    workspaceId: z.ZodNumber;
    generatedAt: z.ZodISODateTime;
    content: z.ZodString;
    prCount: z.ZodNumber;
    mergedCount: z.ZodNumber;
}, z.core.$strip>;
export type SprintSummary = z.infer<typeof SprintSummarySchema>;
//# sourceMappingURL=summary.d.ts.map