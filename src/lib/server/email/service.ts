import { formatDay } from '#lib/format.ts';
import { getT } from '#lib/i18n/index.ts';
import { buildInvites, type InviteKind, type InviteParticipant } from '#lib/invites.ts';
import type { Db } from '../db/index.ts';
import { markInvitesSent, markWishlistInvited } from '../events.ts';
import { renderAdminEmail, renderAllReadyEmail } from './admin-template.ts';
import { renderInviteEmail } from './invite-template.ts';
import { sendEmail } from './send.ts';

interface EventForEmail {
	name: string;
	exchangeDate: string | null;
	budget: string | null;
	message?: string | null;
	locale?: string | null;
}

interface OrganizerEvent {
	name: string;
	organizerName: string;
	organizerEmail: string;
	adminToken: string;
	locale?: string | null;
}

/**
 * Spedisce gli inviti (tutti, o solo `onlyIds`) della fase indicata e segna come inviati
 * quelli andati a buon fine. Un errore su una mail non blocca le altre.
 */
export async function sendInvites(
	db: Db,
	origin: string,
	ev: EventForEmail,
	participants: InviteParticipant[],
	onlyIds?: string[] | null,
	kind: InviteKind = 'draw'
) {
	const t = getT(ev.locale);
	const invites = buildInvites(participants, kind, t).filter(
		(i) => !onlyIds || onlyIds.includes(i.participantId)
	);

	const results = await Promise.allSettled(
		invites.map(async (invite) => {
			const email = renderInviteEmail({
				invite,
				kind,
				eventName: ev.name,
				exchangeDate: formatDay(ev.exchangeDate, t.intlLocale),
				budget: ev.budget,
				message: ev.message,
				link: `${origin}/r/${invite.token}`,
				t
			});
			await sendEmail({ to: invite.to, ...email });
			return invite.participantId;
		})
	);

	const sent = results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));
	const failed = invites.filter((_, i) => results[i].status === 'rejected').map((i) => i.forName);
	results.forEach((r) => r.status === 'rejected' && console.error('[email]', r.reason));

	if (kind === 'wishlist') await markWishlistInvited(db, sent);
	else await markInvitesSent(db, sent);
	return { sent: sent.length, failed };
}

export async function sendAdminLink(origin: string, ev: OrganizerEvent) {
	const email = renderAdminEmail({
		organizerName: ev.organizerName,
		eventName: ev.name,
		link: `${origin}/evento/${ev.adminToken}`,
		t: getT(ev.locale)
	});
	await sendEmail({ to: ev.organizerEmail, ...email });
}

export async function sendAllReady(origin: string, ev: OrganizerEvent, count: number) {
	const email = renderAllReadyEmail({
		organizerName: ev.organizerName,
		eventName: ev.name,
		count,
		link: `${origin}/evento/${ev.adminToken}`,
		t: getT(ev.locale)
	});
	await sendEmail({ to: ev.organizerEmail, ...email });
}
