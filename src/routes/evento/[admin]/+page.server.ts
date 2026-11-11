import { error, fail } from '@sveltejs/kit';
import { field, guard } from '#lib/server/actions.ts';
import { getDb } from '#lib/server/db/index.ts';
import { sendInvites } from '#lib/server/email/service.ts';
import {
	addExclusion,
	addParticipant,
	getAdminView,
	getInviteParticipants,
	localeForAdmin,
	removeExclusion,
	removeParticipant,
	requireEventForAdmin,
	runDraw,
	setEventVideo,
	toVideoSlot,
	setPhoto
} from '#lib/server/events.ts';
import { readPhoto } from '#lib/server/photos.ts';
import {
	deleteVideo,
	saveLocalVideo,
	validatePoster,
	verifyBlobVideo,
	videoMode
} from '#lib/server/video.ts';
import { getT, toLocale } from '#lib/i18n/index.ts';
import { appOrigin } from '#lib/server/origin.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const view = await getAdminView(await getDb(), params.admin);
	if (!view) error(404, 'Evento non trovato');
	return {
		...view,
		locale: toLocale(view.event.locale),
		isNew: url.searchParams.has('nuovo'),
		videoMode: videoMode()
	};
};

export const actions: Actions = {
	add: async ({ params, request }) => {
		const data = await request.formData();
		const db = await getDb();
		const lang = () => localeForAdmin(db, params.admin);
		return guard(async () => {
			await addParticipant(db, params.admin, {
				name: field(data, 'name'),
				email: field(data, 'email'),
				managedById: field(data, 'managedById') || null,
				photo: await readPhoto(data.get('photo'))
			});
			return { ok: true };
		}, lang);
	},

	photo: async ({ params, request }) => {
		const data = await request.formData();
		const db = await getDb();
		const lang = () => localeForAdmin(db, params.admin);
		return guard(async () => {
			const input = await readPhoto(data.get('photo'));
			if (!input) return fail(400, { error: getT(await lang()).errors.photoMissing });
			await setPhoto(db, params.admin, field(data, 'id'), input);
			return { ok: true };
		}, lang);
	},

	remove: async ({ params, request }) => {
		const data = await request.formData();
		const db = await getDb();
		const lang = () => localeForAdmin(db, params.admin);
		return guard(async () => {
			await removeParticipant(db, params.admin, field(data, 'id'));
			return { ok: true };
		}, lang);
	},

	exclude: async ({ params, request }) => {
		const data = await request.formData();
		const db = await getDb();
		const lang = () => localeForAdmin(db, params.admin);
		return guard(async () => {
			await addExclusion(db, params.admin, field(data, 'a'), field(data, 'b'));
			return { ok: true };
		}, lang);
	},

	unexclude: async ({ params, request }) => {
		const data = await request.formData();
		const db = await getDb();
		const lang = () => localeForAdmin(db, params.admin);
		return guard(async () => {
			await removeExclusion(db, params.admin, field(data, 'a'), field(data, 'b'));
			return { ok: true };
		}, lang);
	},

	draw: async ({ params, url }) => {
		const db = await getDb();
		const lang = () => localeForAdmin(db, params.admin);
		return guard(async () => {
			const { event, participants } = await runDraw(db, params.admin);
			const result = await sendInvites(db, appOrigin(url), event, participants);
			return { drawn: true, ...result };
		}, lang);
	},

	/** Fase 1: invita a scrivere la lista chi non ha ancora ricevuto l'invito. */
	inviteWishlist: async ({ params, url }) => {
		const db = await getDb();
		const lang = () => localeForAdmin(db, params.admin);
		return guard(async () => {
			const { event, kind, participants, sendTo } = await getInviteParticipants(db, params.admin, {
				onlyNotInvited: true
			});
			if (kind !== 'wishlist') return fail(400, { error: getT(event.locale).errors.alreadyDrawn });
			if (sendTo.length === 0) return fail(400, { error: getT(event.locale).errors.allInvited });
			const result = await sendInvites(db, appOrigin(url), event, participants, sendTo, kind);
			return { invited: true, ...result };
		}, lang);
	},

	/** Rimanda l'invito della fase in corso (lista prima dell'estrazione, busta dopo). */
	resend: async ({ params, request, url }) => {
		const data = await request.formData();
		const id = field(data, 'id');
		const db = await getDb();
		const lang = () => localeForAdmin(db, params.admin);
		if (!id) return fail(400, { error: getT(await lang()).errors.missingParticipant });
		return guard(async () => {
			const { event, kind, participants, sendTo } = await getInviteParticipants(db, params.admin, {
				onlyIds: [id]
			});
			const result = await sendInvites(db, appOrigin(url), event, participants, sendTo, kind);
			return { resent: true, ...result };
		}, lang);
	},
	/** Video caricato direttamente su Vercel Blob dal browser: qui si verifica e si collega all'evento. */
	video: async ({ params, request }) => {
		const data = await request.formData();
		const db = await getDb();
		const lang = () => localeForAdmin(db, params.admin);
		return guard(async () => {
			const ev = await requireEventForAdmin(db, params.admin);
			const url = await verifyBlobVideo(field(data, 'url'), ev.id);
			const poster = validatePoster(field(data, 'poster'));
			const slot = toVideoSlot(field(data, 'slot'));
			const { previousUrl } = await setEventVideo(db, params.admin, { url, poster }, slot);
			await deleteVideo(previousUrl);
			return { ok: true };
		}, lang);
	},

	/** Solo sviluppo senza token Blob: il file passa dal server e finisce in `.uploads/`. */
	videoLocal: async ({ params, request }) => {
		if (videoMode() !== 'local') return fail(404, { error: 'Not found' });
		const data = await request.formData();
		const db = await getDb();
		const lang = () => localeForAdmin(db, params.admin);
		return guard(async () => {
			const ev = await requireEventForAdmin(db, params.admin);
			const poster = validatePoster(field(data, 'poster'));
			const url = await saveLocalVideo(data.get('video'), ev.id);
			const slot = toVideoSlot(field(data, 'slot'));
			const { previousUrl } = await setEventVideo(db, params.admin, { url, poster }, slot);
			await deleteVideo(previousUrl);
			return { ok: true };
		}, lang);
	},

	removeVideo: async ({ params, request }) => {
		const data = await request.formData();
		const db = await getDb();
		const lang = () => localeForAdmin(db, params.admin);
		return guard(async () => {
			const slot = toVideoSlot(field(data, 'slot'));
			const { previousUrl } = await setEventVideo(db, params.admin, null, slot);
			await deleteVideo(previousUrl);
			return { ok: true };
		}, lang);
	}
};
