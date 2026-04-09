import { z } from "zod";
export declare const ApiSuccessSchema: <T extends z.ZodTypeAny>(dataSchema: T) => z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: T;
}, z.core.$strip>;
export declare const ApiErrorSchema: z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodString;
    code: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ApiSuccess<T> = {
    success: true;
    data: T;
};
export type ApiError = {
    success: false;
    error: string;
    code?: string;
};
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
//# sourceMappingURL=api.d.ts.map