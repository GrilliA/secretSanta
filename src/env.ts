import { defineEnvVars } from '@sveltejs/kit/env';

const optional = (value: string | undefined) => value || undefined;

export const variables = defineEnvVars({
	DATABASE_URL: {
		description:
			'Stringa di connessione Neon (Postgres). In sviluppo, se vuota, si usa PGlite locale in .pglite/.',
		schema: optional
	},
	RESEND_API_KEY: {
		description: 'Chiave API di Resend per inviare le email. Senza, le email vengono solo loggate.',
		schema: optional
	},
	EMAIL_FROM: {
		description: 'Mittente delle email, es. "Secret Santa <santa@tuodominio.it>".',
		schema: (value) => value || 'Secret Santa <onboarding@resend.dev>'
	},
	BLOB_READ_WRITE_TOKEN: {
		description:
			'Token di Vercel Blob per i video di sfondo. In sviluppo, se vuoto, i video si salvano in .uploads/.',
		schema: optional
	},
	APP_URL: {
		description:
			'URL pubblico dell’app per i link nelle email. Se vuoto si usa l’origine della richiesta.',
		schema: optional
	}
});
