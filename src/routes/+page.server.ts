import { redirect } from '@sveltejs/kit';
import { field, guard } from '#lib/server/actions.ts';
import { getDb } from '#lib/server/db/index.ts';
import { sendAdminLink } from '#lib/server/email/service.ts';
import { createEvent } from '#lib/server/events.ts';
import { appOrigin } from '#lib/server/origin.ts';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, url }) => {
		const data = await request.formData();
		const db = await getDb();

		const result = await guard(() =>
			createEvent(db, {
				name: field(data, 'name'),
				exchangeDate: field(data, 'exchangeDate'),
				budget: field(data, 'budget'),
				message: field(data, 'message'),
				organizerName: field(data, 'organizerName'),
				organizerEmail: field(data, 'organizerEmail'),
				organizerPlays: data.get('organizerPlays') === 'on'
			})
		);
		if (!('adminToken' in result)) return result;

		try {
			await sendAdminLink(appOrigin(url), result);
		} catch (err) {
			// Non blocca: il link è comunque mostrato nella pagina di gestione.
			console.error('[email] invio link organizzatore fallito', err);
		}
		redirect(303, `/evento/${result.adminToken}?nuovo=1`);
	}
};
