import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}
export * from "drizzle-orm";
const queryClient = postgres(process.env.DATABASE_URL);

export const db = drizzle(queryClient, { schema });

export type Database = typeof db;





// import { drizzle } from 'drizzle-orm/postgres-js';
// import postgres from 'postgres';
// import * as dotenv from 'dotenv';
// import * as schema from './schema';

// dotenv.config();

// const connectionString = process.env.DATABASE_URL!;
// console.log(connectionString,"???????")
// if (!connectionString) {
//     throw new Error("DATABASE_URL is not set");
// }
// const client = postgres(connectionString);

// export const db = drizzle(client, { schema });
// export type Database = typeof db;
