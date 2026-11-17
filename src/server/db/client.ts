import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. See .env.example and specs/001-foundation/tasks.md (T09).");
}

/** Drizzle over Neon's HTTP driver: no connection to keep open, suited to serverless (plan §5). */
export const db = drizzle(neon(databaseUrl), { schema });
