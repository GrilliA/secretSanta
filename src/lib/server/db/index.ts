import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { DATABASE_URL } from '$app/env/private';

let instance: ReturnType<typeof drizzle<typeof schema>> | undefined;

/** Connessione lazy: l'app gira (con dati demo) anche senza DATABASE_URL. */
export function getDb() {
	if (!DATABASE_URL) throw new Error('DATABASE_URL non impostata: vedi .env.example');
	instance ??= drizzle(postgres(DATABASE_URL), { schema });
	return instance;
}
