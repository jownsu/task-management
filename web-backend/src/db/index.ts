import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "@/config/environment";
import * as schema from "./schema";

const sql = neon(config.database.url!);

export const db = drizzle({ client: sql, schema });