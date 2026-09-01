import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Drizzle ORM database instance initialized with node-postgres pool and schema.
 */
export const db = drizzle(pool, { schema });

/**
 * Type of the Drizzle database instance.
 */
export type Database = typeof db;
