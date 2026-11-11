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
	GMAIL_USER: {
		description:
			'Indirizzo Gmail da cui inviare (via SMTP). Se c’è insieme a GMAIL_APP_PASSWORD, ha la precedenza su Resend.',
		schema: optional
	},
	GMAIL_APP_PASSWORD: {
		description: 'Password per le app di Google (16 caratteri) per GMAIL_USER.',
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
