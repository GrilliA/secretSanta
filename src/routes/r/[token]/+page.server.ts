import { error } from '@sveltejs/kit';
import { field, guard } from '#lib/server/actions.ts';
import { getDb } from '#lib/server/db/index.ts';
import { addWish, getInviteView, markOpened, removeWish } from '#lib/server/events.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	const db = await getDb();
	const view = await getInviteView(db, params.token);
	if (!view) error(404, 'Invito non trovato');

	// Pagina personale: niente cache condivise e niente indicizzazione.
	setHeaders({ 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex' });

	if (view.receiver && view.firstOpen) await markOpened(db, view.me.id);
	const { id: _id, ...me } = view.me;
	return { ...view, me };
};

export const actions: Actions = {
	addWish: async ({ params, request }) => {
		const data = await request.formData();
		const db = await getDb();
		return guard(async () => {
			await addWish(db, params.token, field(data, 'text'));
			return { ok: true };
		});
	},
	removeWish: async ({ params, request }) => {
		const data = await request.formData();
		const db = await getDb();
		return guard(async () => {
			await removeWish(db, params.token, field(data, 'id'));
			return { ok: true };
		});
	}
};
