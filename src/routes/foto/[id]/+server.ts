import { error } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index.ts';
import { getPhoto } from '#lib/server/events.ts';
import type { RequestHandler } from './$types';

/** Serve una foto. L'id è casuale e cambia a ogni sostituzione: cache "per sempre". */
export const GET: RequestHandler = async ({ params }) => {
	const found = await getPhoto(await getDb(), params.id);
	if (!found) error(404, 'Foto non trovata');

	return new Response(Buffer.from(found.data, 'base64'), {
		headers: {
			'content-type': found.mime,
			'cache-control': 'public, max-age=31536000, immutable',
			'x-content-type-options': 'nosniff',
			'x-robots-tag': 'noindex'
		}
	});
};
