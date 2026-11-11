import nodemailer, { type Transporter } from 'nodemailer';
import { EMAIL_FROM, GMAIL_APP_PASSWORD, GMAIL_USER, RESEND_API_KEY } from '$app/env/private';

export interface OutgoingEmail {
	to: string;
	subject: string;
	html: string;
	text: string;
}

/** Nome che compare come mittente (l'indirizzo, con Gmail, è sempre quello dell'account). */
export function senderName() {
	return EMAIL_FROM.match(/^\s*"?([^"<]+?)"?\s*</)?.[1] ?? 'Secret Santa';
}

let gmail: Transporter | null = null;
function gmailTransport() {
	gmail ??= nodemailer.createTransport({
		service: 'gmail',
		pool: true,
		maxConnections: 3,
		auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD?.replace(/\s+/g, '') }
	});
	return gmail;
}

/**
 * Invia una email:
 * - con Gmail (SMTP) se ci sono GMAIL_USER + GMAIL_APP_PASSWORD;
 * - altrimenti con Resend (https://resend.com/docs/api-reference/emails/send-email);
 * - senza nessuna delle due la mail viene solo stampata in console: comodo in sviluppo.
 */
export async function sendEmail(email: OutgoingEmail) {
	if (GMAIL_USER && GMAIL_APP_PASSWORD) {
		const info = await gmailTransport().sendMail({
			from: { name: senderName(), address: GMAIL_USER },
			...email
		});
		return { id: info.messageId };
	}

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
