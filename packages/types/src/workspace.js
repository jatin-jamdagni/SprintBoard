import { z } from "zod";
export const WorkspaceSchema = z.object({
    id: z.number(),
    name: z.string().min(1),
    githubOrg: z.string().min(1),
    githubRepo: z.string().min(1),
    createdAt: z.iso.datetime(),
});
export const CreateWorkspaceSchema = WorkspaceSchema.omit({
    id: true,
    createdAt: true,
});
