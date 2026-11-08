const esc = (s: string) =>
	s.replace(
		/[&<>"']/g,
		(c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!
	);

/** Email all'organizzatore con il link segreto per gestire l'evento. */
export function renderAdminEmail(d: { organizerName: string; eventName: string; link: string }) {
	const subject = `Gestisci “${d.eventName}”`;
	const html = `<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(subject)}</title></head>
<body style="margin:0;background:#EFE6D6;font-family:Inter,Helvetica,Arial,sans-serif;color:#1E1A16">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EFE6D6;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FBF4E8;border-radius:16px;overflow:hidden">
<tr><td style="background:#0F3D2E;color:#FBF4E8;padding:36px 40px">
<h1 style="margin:0;font-family:Fraunces,Georgia,serif;font-weight:800;font-size:28px;line-height:1.2">Ciao ${esc(d.organizerName)}, il tuo Secret Santa è pronto!</h1>
</td></tr>
<tr><td style="padding:28px 40px 12px;font-size:16px;line-height:1.55">Da questo link aggiungi i partecipanti, imposti le esclusioni e lanci l’estrazione di <strong>${esc(d.eventName)}</strong>. Conservalo: è l’unico modo per gestire l’evento.</td></tr>
<tr><td align="center" style="padding:16px 40px"><a href="${esc(d.link)}" style="display:inline-block;background:#B4232A;color:#FFFFFF;text-decoration:none;font-weight:600;padding:16px 32px;border-radius:14px">Gestisci l’evento</a></td></tr>
<tr><td style="padding:8px 40px 36px;font-size:13px;color:#6B5F50">Tranquillo: da qui non potrai vedere chi ha pescato chi.</td></tr>
</table></td></tr></table></body></html>`;
	const text = `Ciao ${d.organizerName}, il tuo Secret Santa "${d.eventName}" è pronto.\nGestiscilo da qui (conserva il link): ${d.link}`;
	return { subject, html, text };
}
