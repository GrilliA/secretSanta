import { esc, renderLayout } from './layout.ts';

/** Email all'organizzatore con il link segreto per gestire l'evento. */
export function renderAdminEmail(d: { organizerName: string; eventName: string; link: string }) {
	const subject = `Gestisci “${d.eventName}”`;
	const html = renderLayout({
		subject,
		titleHtml: `Ciao ${esc(d.organizerName)}, il tuo Secret Santa è pronto!`,
		bodyHtml: `Da questo link aggiungi i partecipanti, mandi gli inviti per la lista dei desideri e poi lanci l’estrazione di <strong>${esc(d.eventName)}</strong>. Conservalo: è l’unico modo per gestire l’evento.`,
		cta: { label: 'Gestisci l’evento', href: d.link },
		footnote: 'Tranquillo: da qui non potrai vedere chi ha pescato chi.'
	});
	const text = `Ciao ${d.organizerName}, il tuo Secret Santa "${d.eventName}" è pronto.\nGestiscilo da qui (conserva il link): ${d.link}`;
	return { subject, html, text };
}

/** Avviso all'organizzatore: tutte le liste sono pronte, si può estrarre. */
export function renderAllReadyEmail(d: {
	organizerName: string;
	eventName: string;
	count: number;
	link: string;
}) {
	const subject = `Tutte le liste sono pronte: puoi fare l’estrazione!`;
	const html = renderLayout({
		subject,
		eyebrow: d.eventName,
		titleHtml: `Ciao ${esc(d.organizerName)}, è il momento di <em style="color:#F3D27A;font-weight:600">pescare!</em>`,
		bodyHtml: `Tutte le ${d.count} persone hanno scritto la loro lista dei desideri. Apri la pagina dell’evento e premi <strong>“Estrai e invia”</strong>: ognuno riceverà la sua busta.`,
		cta: { label: 'Vai all’estrazione', href: d.link },
		footnote: 'Nessuno, nemmeno tu, vedrà gli abbinamenti.'
	});
	const text = `Tutte le liste di "${d.eventName}" sono pronte (${d.count} persone).\nFai l'estrazione da qui: ${d.link}`;
	return { subject, html, text };
}
