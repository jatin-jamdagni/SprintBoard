import { eq } from "drizzle-orm";
import { db } from "../client";
import { workspaces } from "../schema";
import type { InsertWorkspaceRow } from "../schema";

export async function getWorkspaceById(id: number) {
  const result = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, id))
    .limit(1);
  return result[0] ?? null;
}


export async function getAllWorkspaces(){
    return db.select().from(workspaces);
}


export async function createWorkspace(data: InsertWorkspaceRow){
    const result = await db.insert(workspaces).values(data).returning();

    return result[0];
}



export async function deleteWorkspace(id: number){
    await db.delete(workspaces).where(eq(workspaces.id, id))
}