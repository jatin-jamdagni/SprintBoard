import { z } from "zod";
export declare const WorkspaceSchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    githubOrg: z.ZodString;
    githubRepo: z.ZodString;
    createdAt: z.ZodISODateTime;
}, z.core.$strip>;
export type Workspace = z.infer<typeof WorkspaceSchema>;
export declare const CreateWorkspaceSchema: z.ZodObject<{
    name: z.ZodString;
    githubOrg: z.ZodString;
    githubRepo: z.ZodString;
}, z.core.$strip>;
export type CreateWorkspace = z.infer<typeof CreateWorkspaceSchema>;
//# sourceMappingURL=workspace.d.ts.map