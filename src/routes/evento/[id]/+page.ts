import { error } from '@sveltejs/kit';
import { demoEvent, demoExclusions, demoParticipants } from '#lib/demo.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	// TODO: leggere evento e partecipanti dal database.
	if (params.id !== demoEvent.id) error(404, 'Evento non trovato');
	return {
		event: demoEvent,
		participants: demoParticipants.map((p) => ({
			id: p.id,
			name: p.name,
			email: p.email,
			managedById: p.managedById ?? null,
			isOrganizer: p.isOrganizer ?? false,
			token: p.token
		})),
		exclusions: demoExclusions
	};
};
