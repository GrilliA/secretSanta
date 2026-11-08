import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import * as schema from './schema.ts';
import { dev } from '$app/env';
import { DATABASE_URL } from '$app/env/private';

/**
 * Tipo comune a tutti i driver Postgres di Drizzle (Neon in produzione, PGlite in sviluppo/test).
 * Il codice di dominio riceve sempre `Db` come parametro, così è testabile senza rete.
 */
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

let instance: Promise<Db> | undefined;

/**
 * - Con `DATABASE_URL`: Neon via HTTP (ideale per le funzioni serverless di Vercel).
 * - In sviluppo senza `DATABASE_URL`: PGlite salvato in `.pglite/`, con le migrazioni applicate.
 */
export function getDb(): Promise<Db> {
	instance ??= connect();
	return instance;
}

async function connect(): Promise<Db> {
	if (DATABASE_URL) {
		return drizzle(neon(DATABASE_URL), { schema }) as unknown as Db;
	}
	if (dev) {
		const { PGlite } = await import('@electric-sql/pglite');
		const { drizzle: drizzlePglite } = await import('drizzle-orm/pglite');
		const { migrate } = await import('drizzle-orm/pglite/migrator');
		const db = drizzlePglite(new PGlite('./.pglite'), { schema });
		await migrate(db, { migrationsFolder: './drizzle' });
		console.info('[db] DATABASE_URL non impostata: uso PGlite locale in .pglite/');
		return db as unknown as Db;
	}
	throw new Error('DATABASE_URL non impostata: vedi .env.example');
}
