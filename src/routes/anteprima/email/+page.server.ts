import { error } from '@sveltejs/kit';
import { dev } from '$app/env';
import { demoEvent, demoParticipants } from '#lib/demo.ts';
import { buildInvites } from '#lib/invites.ts';
import { renderInviteEmail } from '#lib/server/email/invite-template.ts';
import type { PageServerLoad } from './$types';

/** Anteprima delle email d'invito con i dati demo (solo per sviluppo). */
export const load: PageServerLoad = ({ url }) => {
	if (!dev) error(404, 'Non trovato');
	const emails = buildInvites(demoParticipants).map((invite) => ({
		to: invite.to,
		...renderInviteEmail({
			invite,
			eventName: demoEvent.name,
			exchangeDate: demoEvent.exchangeDate,
			budget: demoEvent.budget,
			link: `${url.origin}/r/${invite.token}`
		})
	}));
	return { emails };
};
