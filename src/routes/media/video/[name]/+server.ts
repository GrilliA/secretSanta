import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { error } from '@sveltejs/kit';
import { dev } from '$app/env';
import { LOCAL_DIR } from '#lib/server/video.ts';
import type { RequestHandler } from './$types';

const TYPES: Record<string, string> = {
	mp4: 'video/mp4',
	webm: 'video/webm',
	mov: 'video/quicktime'
};

/** Solo sviluppo: serve i video salvati in `.uploads/video/`, con supporto alle richieste Range. */
export const GET: RequestHandler = async ({ params, request }) => {
	if (!dev || !/^[\w-]+\.(mp4|webm|mov)$/.test(params.name)) error(404, 'Not found');
	const path = join(LOCAL_DIR, params.name);
	const info = await stat(path).catch(() => null);
	if (!info) error(404, 'Not found');

	const type = TYPES[params.name.split('.').pop()!];
	const range = request.headers.get('range')?.match(/bytes=(\d*)-(\d*)/);
	if (!range) {
		return new Response(Readable.toWeb(createReadStream(path)) as ReadableStream, {
			headers: {
				'content-type': type,
				'content-length': String(info.size),
				'accept-ranges': 'bytes'
			}
		});
	}
	const start = range[1] ? Number(range[1]) : 0;
	const end = range[2] ? Math.min(Number(range[2]), info.size - 1) : info.size - 1;
	return new Response(Readable.toWeb(createReadStream(path, { start, end })) as ReadableStream, {
		status: 206,
		headers: {
			'content-type': type,
			'content-length': String(end - start + 1),
			'content-range': `bytes ${start}-${end}/${info.size}`,
			'accept-ranges': 'bytes'
		}
	});
};
