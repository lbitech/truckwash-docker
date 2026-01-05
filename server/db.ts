import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/node-postgres';
import ws from "ws";
import * as schema from "@shared/schema";
import pg from 'pg';
const { Pool: PgPool } = pg;

// Use local Postgres connection
export const pool = new PgPool({
    connectionString: process.env.DATABASE_URL || "postgresql://truckwash_user:password@uktruck:europe-west2:truckwash-pg:5432/truckwash"
});
export const db = drizzle(pool, { schema });
