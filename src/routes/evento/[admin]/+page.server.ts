import { error, fail } from '@sveltejs/kit';
import { field, guard } from '#lib/server/actions.ts';
import { getDb } from '#lib/server/db/index.ts';
import { sendInvites } from '#lib/server/email/service.ts';
import {
	addExclusion,
	addParticipant,
	getAdminView,
	getInviteParticipants,
	removeExclusion,
	removeParticipant,
	runDraw,
	setPhoto
} from '#lib/server/events.ts';
import { readPhoto } from '#lib/server/photos.ts';
import { appOrigin } from '#lib/server/origin.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const view = await getAdminView(await getDb(), params.admin);
	if (!view) error(404, 'Evento non trovato');
	return { ...view, isNew: url.searchParams.has('nuovo') };
};

export const actions: Actions = {
	add: async ({ params, request }) => {
		const data = await request.formData();
		const db = await getDb();
		return guard(async () => {
			await addParticipant(db, params.admin, {
				name: field(data, 'name'),
				email: field(data, 'email'),
				managedById: field(data, 'managedById') || null,
				photo: await readPhoto(data.get('photo'))
			});
			return { ok: true };
		});
	},

	photo: async ({ params, request }) => {
		const data = await request.formData();
		const db = await getDb();
		return guard(async () => {
			const input = await readPhoto(data.get('photo'));
			if (!input) return fail(400, { error: 'Scegli una foto.' });
			await setPhoto(db, params.admin, field(data, 'id'), input);
			return { ok: true };
		});
	},

	remove: async ({ params, request }) => {
		const data = await request.formData();
		const db = await getDb();
		return guard(async () => {
			await removeParticipant(db, params.admin, field(data, 'id'));
			return { ok: true };
		});
	},

	exclude: async ({ params, request }) => {
		const data = await request.formData();
		const db = await getDb();
		return guard(async () => {
			await addExclusion(db, params.admin, field(data, 'a'), field(data, 'b'));
			return { ok: true };
		});
	},

	unexclude: async ({ params, request }) => {
		const data = await request.formData();
		const db = await getDb();
		return guard(async () => {
			await removeExclusion(db, params.admin, field(data, 'a'), field(data, 'b'));
			return { ok: true };
		});
	},

	draw: async ({ params, url }) => {
		const db = await getDb();
		return guard(async () => {
			const { event, participants } = await runDraw(db, params.admin);
			const result = await sendInvites(db, appOrigin(url), event, participants);
			return { drawn: true, ...result };
		});
	},

	resend: async ({ params, request, url }) => {
		const data = await request.formData();
		const id = field(data, 'id');
		if (!id) return fail(400, { error: 'Partecipante mancante.' });
		const db = await getDb();
		return guard(async () => {
			const { event, participants } = await getInviteParticipants(db, params.admin);
			const result = await sendInvites(db, appOrigin(url), event, participants, [id]);
			return { resent: true, ...result };
		});
	}
};
