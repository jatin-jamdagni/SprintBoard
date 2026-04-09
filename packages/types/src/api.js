import { z } from "zod";
export const ApiSuccessSchema = (dataSchema) => z.object({ success: z.literal(true), data: dataSchema });
export const ApiErrorSchema = z.object({
    success: z.literal(false),
    error: z.string(),
    code: z.string().optional(),
});
