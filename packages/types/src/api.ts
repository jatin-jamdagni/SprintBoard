import { z } from "zod";

export const ApiSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({ success: z.literal(true), data: dataSchema });

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
});

export type ApiSuccess<T> = { success: true; data: T };
export type ApiError = { success: false; error: string; code?: string };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;