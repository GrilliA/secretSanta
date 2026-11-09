import { getT, type Messages } from '#lib/i18n/index.ts';
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
	t?: Messages;
}

/**
 * Email per il partecipante, nella lingua dell'evento.
 * - `wishlist` (fase 1): invito a scrivere la lista dei desideri, nessun abbinamento ancora.
 * - `draw` (fase 2): l'estrazione è fatta, apri la busta.
 */
export function renderInviteEmail(d: InviteTemplateData) {
	const t = d.t ?? getT('it');
	const e = t.email;
	const kind = d.kind ?? 'draw';
	const name = d.invite.forName;
	const managed = d.invite.managerName;

	const notice = managed
		? e.managedNotice(name, managed) +
			(kind === 'draw' ? e.managedNoticeDraw : e.managedNoticeWishlist)
		: null;

	const facts: [string, string][] = [];
	if (d.exchangeDate) facts.push([e.exchangeDate, d.exchangeDate]);
	if (d.budget) facts.push([e.budget, d.budget]);

	const message = d.message
		? `<p style="margin:0 0 12px;font-style:italic">“${esc(d.message)}”</p>`
		: '';
	const em = (s: string) => `<em style="color:#F3D27A;font-weight:600">${esc(s)}</em>`;

	const content =
		kind === 'wishlist'
			? {
					titleHtml: `${esc(e.wishlist.title(name))} ${em(e.wishlist.titleEm)}`,
					bodyHtml: `${message}${esc(e.wishlist.body)} <strong>${esc(e.wishlist.bodyButton)}</strong>.`,
					cta: e.wishlist.cta,
					footnote: e.wishlist.footnote,
					text: e.wishlist.text(d.eventName)
				}
			: {
					titleHtml: `${esc(e.draw.title(name))} ${em(e.draw.titleEm)}`,
					bodyHtml: `${message}${esc(e.draw.body)}`,
					cta: e.draw.cta,
					footnote: e.draw.footnote,
					text: e.draw.text(name, d.eventName)
				};

	const html = renderLayout({
		lang: t.locale,
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
		d.exchangeDate ? `${e.exchangeDate}: ${d.exchangeDate}` : '',
		d.budget ? `${e.budget}: ${d.budget}` : '',
		`${content.cta}: ${d.link}`,
		e.personalLink
	]
		.filter(Boolean)
		.join('\n');

	return { subject: d.invite.subject, html, text };
}
