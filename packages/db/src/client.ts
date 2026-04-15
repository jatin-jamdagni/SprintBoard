import { env } from "@repo/config/server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const queryClient = postgres(env.DATABASE_URL);

/**
 * The `db` instance provides a typed interface to interact with the PostgreSQL database
 * using Drizzle ORM and the defined schema. Use this instance for all database queries
 * and operations within the application context.
 */
export const db = drizzle(queryClient, { schema });

export type Database = typeof db;
