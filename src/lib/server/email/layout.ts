/**
 * Layout comune delle email: HTML a tabelle con stili inline (compatibile con Gmail/Outlook),
 * palette del design "Secret Santa". Tutti i testi passano da `esc()`, tranne `bodyHtml` che
 * va costruito dal chiamante con valori già escapati.
 */

export const esc = (s: string) =>
	s.replace(
		/[&<>"']/g,
		(c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!
	);

export interface LayoutInput {
	lang?: string;
	subject: string;
	eyebrow?: string | null;
	/** Titolo già in HTML (escapato dal chiamante). */
	titleHtml: string;
	/** Riquadro rosa in evidenza (testo semplice). */
	notice?: string | null;
	/** Paragrafi principali, già in HTML escapato. */
	bodyHtml: string;
	facts?: [string, string][];
	cta: { label: string; href: string };
	footnote?: string | null;
}

export function renderLayout(d: LayoutInput) {
	const facts = (d.facts ?? [])
		.map(
			([k, v]) =>
				`<td style="padding:6px"><div style="background:#F3E8D4;border-radius:12px;padding:14px 16px"><div style="font-size:13px;color:#6B5F50">${esc(k)}</div><div style="font-weight:600">${esc(v)}</div></div></td>`
		)
		.join('');

	return `<!doctype html>
<html lang="${d.lang ?? 'it'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(d.subject)}</title></head>
<body style="margin:0;background:#EFE6D6;font-family:Inter,Helvetica,Arial,sans-serif;color:#1E1A16">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EFE6D6;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FBF4E8;border-radius:16px;overflow:hidden">
<tr><td align="center" style="background:#0F3D2E;color:#FBF4E8;padding:44px 40px">
${d.eyebrow ? `<div style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#D4A73A;font-weight:600">${esc(d.eyebrow)}</div>` : ''}
<h1 style="margin:12px 0 0;font-family:Fraunces,Georgia,serif;font-weight:800;font-size:30px;line-height:1.2">${d.titleHtml}</h1>
</td></tr>
<tr><td style="height:24px"></td></tr>
${d.notice ? `<tr><td style="padding:0 40px 20px"><div style="background:#FCF1EF;border-radius:12px;padding:14px 16px;font-size:14px;line-height:1.5;color:#8E1A20">${esc(d.notice)}</div></td></tr>` : ''}
<tr><td style="padding:0 40px 16px;font-size:16px;line-height:1.55">${d.bodyHtml}</td></tr>
${facts ? `<tr><td style="padding:0 34px 12px"><table role="presentation" width="100%"><tr>${facts}</tr></table></td></tr>` : ''}
<tr><td align="center" style="padding:12px 40px 12px"><a href="${esc(d.cta.href)}" style="display:inline-block;background:#B4232A;color:#FFFFFF;text-decoration:none;font-weight:600;padding:16px 32px;border-radius:14px">${esc(d.cta.label)}</a></td></tr>
${d.footnote ? `<tr><td align="center" style="padding:8px 40px 36px;font-size:13px;color:#6B5F50">${esc(d.footnote)}</td></tr>` : '<tr><td style="height:28px"></td></tr>'}
</table></td></tr></table></body></html>`;
}
