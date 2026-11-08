import { defineEnvVars } from '@sveltejs/kit/env';

const optional = (value: string | undefined) => value || undefined;

export const variables = defineEnvVars({
	DATABASE_URL: {
		description: 'Stringa di connessione Postgres (es. Supabase o Neon).',
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
	PUBLIC_APP_URL: {
		public: true,
		description: 'URL pubblico dell’app, usato per i link nelle email.',
		schema: (value) => value || 'http://localhost:5173'
	}
});
