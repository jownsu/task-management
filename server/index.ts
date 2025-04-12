/* DB */
import * as schema from "@/server/schema";

/* PLUGINS */
import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as drizzleServerLess } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_URL as string);
export const db = drizzle(sql, {
	schema
});

export const dbPool = drizzleServerLess(process.env.POSTGRES_URL as string);