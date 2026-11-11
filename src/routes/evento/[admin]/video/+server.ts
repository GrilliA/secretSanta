import { error, json } from '@sveltejs/kit';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { getDb } from '#lib/server/db/index.ts';
import { requireEventForAdmin } from '#lib/server/events.ts';
import { blobPrefix, limitsForPath, videoMode } from '#lib/server/video.ts';
import type { RequestHandler } from './$types';

/**
 * Rilascia il token per caricare il video direttamente dal browser a Vercel Blob
 * (le funzioni Vercel accettano al massimo ~4,5 MB, i video passano accanto al server).
 * Il file può andare solo sotto `video/<id evento>/`, solo come video (o audio, per `music.*`)
 * e solo entro il limite.
 */
export const POST: RequestHandler = async ({ params, request }) => {
	if (videoMode() !== 'blob') error(404, 'Not found');
	const ev = await requireEventForAdmin(await getDb(), params.admin).catch(() => null);
	if (!ev) error(404, 'Not found');

	const body = (await request.json()) as HandleUploadBody;
	try {
		const result = await handleUpload({
			request,
			body,
			onBeforeGenerateToken: async (pathname) => {
				if (!pathname.startsWith(blobPrefix(ev.id))) throw new Error('Percorso non valido');
				const limits = limitsForPath(pathname);
				return {
					allowedContentTypes: [...limits.types],
					maximumSizeInBytes: limits.max,
					addRandomSuffix: true,
					validUntil: Date.now() + 15 * 60 * 1000
				};
			}
		});
		return json(result);
	} catch (err) {
		error(400, err instanceof Error ? err.message : 'Upload non valido');
	}
};
