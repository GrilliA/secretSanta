import { PUBLIC_APP_URL } from '$app/env/public';
import { demoEvent, demoParticipants } from '#lib/demo.ts';
import { buildInvites } from '#lib/invites.ts';
import { renderInviteEmail } from '#lib/server/email/invite-template.ts';
import type { PageServerLoad } from './$types';

/** Anteprima delle email d'invito con i dati demo (solo per sviluppo). */
export const load: PageServerLoad = () => {
	const emails = buildInvites(demoParticipants).map((invite) => ({
		to: invite.to,
		...renderInviteEmail({
			invite,
			eventName: demoEvent.name,
			exchangeDate: demoEvent.exchangeDate,
			budget: demoEvent.budget,
			link: `${PUBLIC_APP_URL}/r/${invite.token}`
		})
	}));
	return { emails };
};
