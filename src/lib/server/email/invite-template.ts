import type { Invite, InviteKind } from '#lib/invites.ts';
import { esc, renderLayout } from './layout.ts';

export interface InviteTemplateData {
	invite: Invite;
	kind?: InviteKind;
	eventName: string;
	exchangeDate: string | null;
	budget: string | null;
	message?: string | null;
	link: string;
}

/**
 * Email per il partecipante.
 * - `wishlist` (fase 1): invito a scrivere la lista dei desideri, nessun abbinamento ancora.
 * - `draw` (fase 2): l'estrazione è fatta, apri la busta.
 */
export function renderInviteEmail(d: InviteTemplateData) {
	const kind = d.kind ?? 'draw';
	const name = d.invite.forName;
	const managed = d.invite.managerName;

	const notice = managed
		? `Questa mail è per ${name}. La ricevi tu, ${managed}, perché gestisci il suo invito.` +
			(kind === 'draw'
				? ' Il tuo abbinamento arriva in una mail a parte.'
				: ' Scrivi tu la sua lista dei desideri.')
		: null;

	const facts: [string, string][] = [];
	if (d.exchangeDate) facts.push(['Data scambio', d.exchangeDate]);
	if (d.budget) facts.push(['Budget', d.budget]);

	const message = d.message
		? `<p style="margin:0 0 12px;font-style:italic">“${esc(d.message)}”</p>`
		: '';

	const content =
		kind === 'wishlist'
			? {
					titleHtml: `${esc(name)}, che cosa vorresti <em style="color:#F3D27A;font-weight:600">trovare sotto l’albero?</em>`,
					bodyHtml: `${message}Prima dell’estrazione, scrivi la tua lista dei desideri: la vedrà solo chi ti farà il regalo. Quando hai finito, premi <strong>“La mia lista è pronta”</strong>.`,
					cta: 'Scrivi la lista dei desideri',
					footnote: 'Quando tutti avranno finito, riceverai una nuova mail con la busta da aprire.',
					text: `Scrivi la tua lista dei desideri per ${d.eventName}`
				}
			: {
					titleHtml: `${esc(name)}, è uscito il tuo <em style="color:#F3D27A;font-weight:600">abbinamento!</em>`,
					bodyHtml: `${message}Apri il link per scoprire a chi fare il regalo e leggere la sua lista dei desideri.`,
					cta: 'Scopri chi hai pescato',
					footnote: 'Il link è personale: non inoltrarlo, altrimenti la sorpresa salta.',
					text: `${name}, è uscito il tuo abbinamento per ${d.eventName}!`
				};

	const html = renderLayout({
		subject: d.invite.subject,
		eyebrow: d.eventName,
		titleHtml: content.titleHtml,
		notice,
		bodyHtml: content.bodyHtml,
		facts,
		cta: { label: content.cta, href: d.link },
		footnote: content.footnote
	});

	const text = [
		content.text,
		notice ?? '',
		d.message ? `“${d.message}”` : '',
		d.exchangeDate ? `Data scambio: ${d.exchangeDate}` : '',
		d.budget ? `Budget: ${d.budget}` : '',
		`${content.cta}: ${d.link}`,
		'Il link è personale: non inoltrarlo.'
	]
		.filter(Boolean)
		.join('\n');

	return { subject: d.invite.subject, html, text };
}
