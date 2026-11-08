import { defineConfig } from 'drizzle-kit';

// `db:generate` non si collega al DB: un URL fittizio basta. `db:migrate`/`db:push` richiedono quello vero.
const url = process.env.DATABASE_URL ?? 'postgres://localhost/placeholder';

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: { url },
	verbose: true,
	strict: true
});
