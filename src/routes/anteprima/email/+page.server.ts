import { error } from '@sveltejs/kit';
import { dev } from '$app/env';
import { demoEvent, demoParticipants } from '#lib/demo.ts';
import { buildInvites, type InviteKind } from '#lib/invites.ts';
import { renderAdminEmail, renderAllReadyEmail } from '#lib/server/email/admin-template.ts';
import { renderInviteEmail } from '#lib/server/email/invite-template.ts';
import type { PageServerLoad } from './$types';

/** Anteprima di tutte le email con i dati demo (solo per sviluppo). */
export const load: PageServerLoad = ({ url }) => {
	if (!dev) error(404, 'Non trovato');
	const link = (path: string) => `${url.origin}${path}`;

	const invites = (['wishlist', 'draw'] as InviteKind[]).flatMap((kind) =>
		buildInvites(demoParticipants, kind).map((invite) => ({
			to: invite.to,
			...renderInviteEmail({
				invite,
				kind,
				eventName: demoEvent.name,
				exchangeDate: demoEvent.exchangeDate,
				budget: demoEvent.budget,
				message: 'Ci vediamo dalla nonna per il pranzo!',
				link: link(`/r/${invite.token}`)
			})
		}))
	);

	const organizer = { name: 'Alessio', email: 'alessio@email.it' };
	const emails = [
		{
			to: organizer.email,
			...renderAdminEmail({
				organizerName: organizer.name,
				eventName: demoEvent.name,
				link: link('/evento/demo')
			})
		},
		...invites,
		{
			to: organizer.email,
			...renderAllReadyEmail({
				organizerName: organizer.name,
				eventName: demoEvent.name,
				count: demoParticipants.length,
				link: link('/evento/demo')
			})
		}
	];
	return { emails };
};
