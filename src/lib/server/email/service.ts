import { formatDay } from '#lib/format.ts';
import { buildInvites, type InviteParticipant } from '#lib/invites.ts';
import type { Db } from '../db/index.ts';
import { markInvitesSent } from '../events.ts';
import { renderAdminEmail } from './admin-template.ts';
import { renderInviteEmail } from './invite-template.ts';
import { sendEmail } from './send.ts';

interface EventForEmail {
	name: string;
	exchangeDate: string | null;
	budget: string | null;
}

/**
 * Spedisce gli inviti (tutti, o solo `onlyIds`) e segna come inviati quelli andati a buon fine.
 * Un errore su una mail non blocca le altre.
 */
export async function sendInvites(
	db: Db,
	origin: string,
	ev: EventForEmail,
	participants: InviteParticipant[],
	onlyIds?: string[] | null
) {
	const invites = buildInvites(participants).filter(
		(i) => !onlyIds || onlyIds.includes(i.participantId)
	);

	const results = await Promise.allSettled(
		invites.map(async (invite) => {
			const email = renderInviteEmail({
				invite,
				eventName: ev.name,
				exchangeDate: formatDay(ev.exchangeDate),
				budget: ev.budget,
				link: `${origin}/r/${invite.token}`
			});
			await sendEmail({ to: invite.to, ...email });
			return invite.participantId;
		})
	);

	const sent = results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));
	const failed = invites.filter((_, i) => results[i].status === 'rejected').map((i) => i.forName);
	results.forEach((r) => r.status === 'rejected' && console.error('[email]', r.reason));

	await markInvitesSent(db, sent);
	return { sent: sent.length, failed };
}

export async function sendAdminLink(
	origin: string,
	ev: { name: string; organizerName: string; organizerEmail: string; adminToken: string }
) {
	const email = renderAdminEmail({
		organizerName: ev.organizerName,
		eventName: ev.name,
		link: `${origin}/evento/${ev.adminToken}`
	});
	await sendEmail({ to: ev.organizerEmail, ...email });
}
