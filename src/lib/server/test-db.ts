import { PGlite } from '@electric-sql/pglite';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import type { Db } from './db/index.ts';
import * as schema from './db/schema.ts';

/** Postgres in memoria (PGlite) con le stesse migrazioni di produzione. Solo per test e sviluppo. */
export async function createTestDb(): Promise<Db> {
	const db = drizzle(new PGlite(), { schema });
	await migrate(db, { migrationsFolder: './drizzle' });
	return db as unknown as Db;
}

/** Svuota tutte le tabelle (più veloce che ricreare PGlite a ogni test). */
export async function resetTestDb(db: Db) {
	await db.execute(sql`TRUNCATE wish, assignment, exclusion, participant, event CASCADE`);
}
