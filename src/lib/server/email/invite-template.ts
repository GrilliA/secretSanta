import type { Invite } from '#lib/invites.ts';

export interface InviteTemplateData {
	invite: Invite;
	eventName: string;
	exchangeDate: string | null;
	budget: string | null;
	link: string;
}

const esc = (s: string) =>
	s.replace(
		/[&<>"']/g,
		(c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!
	);

/**
 * Email d'invito, in HTML a tabelle con stili inline (compatibile con Gmail/Outlook).
 * Palette e testi seguono il design "Secret Santa – Design".
 */
export function renderInviteEmail(d: InviteTemplateData) {
	const name = esc(d.invite.forName);
	const event = esc(d.eventName);
	const managed = d.invite.managerName
		? `<tr><td style="padding:0 40px 20px"><div style="background:#FCF1EF;border-radius:12px;padding:14px 16px;font-size:14px;line-height:1.5;color:#8E1A20">Questa mail è per <strong>${name}</strong>. La ricevi tu, ${esc(d.invite.managerName)}, perché gestisci il suo invito. Il tuo abbinamento arriva in una mail a parte.</div></td></tr>`
		: '';
	const facts = [
		d.exchangeDate && ['Data scambio', esc(d.exchangeDate)],
		d.budget && ['Budget', esc(d.budget)]
	].filter(Boolean) as [string, string][];
	const factCells = facts
		.map(
			([k, v]) =>
				`<td style="padding:6px"><div style="background:#F3E8D4;border-radius:12px;padding:14px 16px"><div style="font-size:13px;color:#6B5F50">${k}</div><div style="font-weight:600">${v}</div></div></td>`
		)
		.join('');

	const html = `<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(d.invite.subject)}</title></head>
<body style="margin:0;background:#EFE6D6;font-family:Inter,Helvetica,Arial,sans-serif;color:#1E1A16">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EFE6D6;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FBF4E8;border-radius:16px;overflow:hidden">
<tr><td align="center" style="background:#0F3D2E;color:#FBF4E8;padding:44px 40px">
<div style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#D4A73A;font-weight:600">${event}</div>
<h1 style="margin:12px 0 0;font-family:Fraunces,Georgia,serif;font-weight:800;font-size:32px;line-height:1.15">${name}, è uscito il tuo <em style="color:#F3D27A;font-weight:600">abbinamento!</em></h1>
</td></tr>
<tr><td style="height:24px"></td></tr>
${managed}
<tr><td style="padding:0 40px 16px;font-size:16px;line-height:1.55">Apri il link per scoprire a chi fare il regalo e per scrivere la tua lista dei desideri.</td></tr>
${factCells ? `<tr><td style="padding:0 34px 12px"><table role="presentation" width="100%"><tr>${factCells}</tr></table></td></tr>` : ''}
<tr><td align="center" style="padding:12px 40px 12px"><a href="${esc(d.link)}" style="display:inline-block;background:#B4232A;color:#FFFFFF;text-decoration:none;font-weight:600;padding:16px 32px;border-radius:14px">Scopri chi hai pescato</a></td></tr>
<tr><td align="center" style="padding:8px 40px 36px;font-size:13px;color:#6B5F50">Il link è personale: non inoltrarlo, altrimenti la sorpresa salta.</td></tr>
</table></td></tr></table></body></html>`;

	const text = [
		`${d.invite.forName}, è uscito il tuo abbinamento per ${d.eventName}!`,
		d.invite.managerName
			? `Questa mail è per ${d.invite.forName}: la ricevi tu, ${d.invite.managerName}, perché gestisci il suo invito.`
			: '',
		d.exchangeDate ? `Data scambio: ${d.exchangeDate}` : '',
		d.budget ? `Budget: ${d.budget}` : '',
		`Scopri chi hai pescato: ${d.link}`,
		'Il link è personale: non inoltrarlo.'
	]
		.filter(Boolean)
		.join('\n');

	return { subject: d.invite.subject, html, text };
}
