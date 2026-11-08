import { error } from '@sveltejs/kit';
import { findDemoByToken } from '#lib/demo.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	// TODO: spostare in +page.server.ts e leggere dal database tramite il token.
	const found = findDemoByToken(params.token);
	if (!found) error(404, 'Invito non trovato');
	return {
		event: found.event,
		me: { name: found.me.name, wishes: found.me.wishes },
		receiver: { name: found.receiver.name, wishes: found.receiver.wishes },
		managerName: found.manager?.name ?? null
	};
};
