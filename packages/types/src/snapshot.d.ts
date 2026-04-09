import { z } from "zod";
export declare const DailySnapshotSchema: z.ZodObject<{
    id: z.ZodNumber;
    workspaceId: z.ZodNumber;
    date: z.ZodISODate;
    prsOpened: z.ZodNumber;
    prsMerged: z.ZodNumber;
    avgReviewLagHours: z.ZodNullable<z.ZodNumber>;
}, z.core.$strip>;
export type DailySnapshot = z.infer<typeof DailySnapshotSchema>;
//# sourceMappingURL=snapshot.d.ts.map