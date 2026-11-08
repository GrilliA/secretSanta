import { getT, type Messages } from '#lib/i18n/index.ts';
import { esc, renderLayout } from './layout.ts';

const em = (s: string) => `<em style="color:#F3D27A;font-weight:600">${esc(s)}</em>`;

/** Email all'organizzatore con il link segreto per gestire l'evento. */
export function renderAdminEmail(d: {
	organizerName: string;
	eventName: string;
	link: string;
	t?: Messages;
}) {
	const t = d.t ?? getT('it');
	const a = t.email.admin;
	const subject = t.email.subjects.admin(d.eventName);
	const html = renderLayout({
		lang: t.locale,
		subject,
		titleHtml: esc(a.title(d.organizerName)),
		bodyHtml: `${esc(a.body)} <strong>${esc(d.eventName)}</strong>. ${esc(a.body2)}`,
		cta: { label: a.cta, href: d.link },
		footnote: a.footnote
	});
	return { subject, html, text: a.text(d.organizerName, d.eventName, d.link) };
}

/** Avviso all'organizzatore: tutte le liste sono pronte, si può estrarre. */
export function renderAllReadyEmail(d: {
	organizerName: string;
	eventName: string;
	count: number;
	link: string;
	t?: Messages;
}) {
	const t = d.t ?? getT('it');
	const r = t.email.allReady;
	const subject = t.email.subjects.allReady;
	const html = renderLayout({
		lang: t.locale,
		subject,
		eyebrow: d.eventName,
		titleHtml: `${esc(r.title(d.organizerName))} ${em(r.titleEm)}`,
		bodyHtml: `${esc(r.body(d.count))} <strong>${esc(r.bodyButton)}</strong>: ${esc(r.body2)}`,
		cta: { label: r.cta, href: d.link },
		footnote: r.footnote
	});
	return { subject, html, text: r.text(d.eventName, d.count, d.link) };
}
