import { EMAIL_FROM, RESEND_API_KEY } from '$app/env/private';

export interface OutgoingEmail {
	to: string;
	subject: string;
	html: string;
	text: string;
}

/**
 * Invia una email con Resend (https://resend.com/docs/api-reference/emails/send-email).
 * Senza RESEND_API_KEY la mail viene solo stampata in console: comodo in sviluppo.
 */
export async function sendEmail(email: OutgoingEmail) {
	if (!RESEND_API_KEY) {
		console.info(`[email:dry-run] → ${email.to} · ${email.subject}\n${email.text}`);
		return { id: 'dry-run' };
	}

	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${RESEND_API_KEY}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ from: EMAIL_FROM, ...email })
	});

	if (!res.ok) {
		throw new Error(`Invio email fallito (${res.status}): ${await res.text()}`);
	}
	return (await res.json()) as { id: string };
}
