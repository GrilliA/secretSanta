import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { del, head } from '@vercel/blob';
import { dev } from '$app/env';
import { BLOB_READ_WRITE_TOKEN } from '$app/env/private';
import { EventError } from './events.ts';
import { createToken } from './token.ts';

/** Limiti del video di sfondo. */
export const VIDEO_MAX_BYTES = 40 * 1024 * 1024;
export const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'] as const;
/** Limiti della musica di sottofondo. */
export const MUSIC_MAX_BYTES = 15 * 1024 * 1024;
export const MUSIC_TYPES = [
	'audio/mpeg',
	'audio/mp4',
	'audio/x-m4a',
	'audio/aac',
	'audio/ogg',
	'audio/wav',
	'audio/x-wav',
	'audio/webm'
] as const;
export type MediaKind = 'video' | 'music';

const LIMITS = {
	video: { types: VIDEO_TYPES as readonly string[], max: VIDEO_MAX_BYTES },
	music: { types: MUSIC_TYPES as readonly string[], max: MUSIC_MAX_BYTES }
};

/** Estensione del file salvato, dal tipo MIME. */
const EXT: Record<string, string> = {
	'video/mp4': 'mp4',
	'video/webm': 'webm',
	'video/quicktime': 'mov',
	'audio/mpeg': 'mp3',
	'audio/mp4': 'm4a',
	'audio/x-m4a': 'm4a',
	'audio/aac': 'aac',
	'audio/ogg': 'ogg',
	'audio/wav': 'wav',
	'audio/x-wav': 'wav',
	'audio/webm': 'weba'
};

/** Nei percorsi Blob la musica sta in `video/<eventId>/music...`. */
export function limitsForPath(pathname: string) {
	return LIMITS[pathname.split('/').pop()?.startsWith('music') ? 'music' : 'video'];
}

export const POSTER_MAX_CHARS = 400_000; // ~300 KB di JPEG in base64

/** Cartella e prefisso URL dei video salvati in locale (solo sviluppo, senza token Blob). */
export const LOCAL_DIR = '.uploads/video';
export const LOCAL_PREFIX = '/media/video/';

export type VideoMode = 'blob' | 'local' | 'none';

/** Dove finiscono i video: Vercel Blob se c'è il token, cartella locale in sviluppo. */
export function videoMode(): VideoMode {
	if (BLOB_READ_WRITE_TOKEN) return 'blob';
	return dev ? 'local' : 'none';
}

/** Ogni evento carica i suoi video sotto `video/<eventId>/`: così si verifica a chi appartengono. */
export function blobPrefix(eventId: string) {
	return `video/${eventId}/`;
}

/** Fotogramma generato nel browser: deve essere un piccolo JPEG in data URL. */
export function validatePoster(value: string | null | undefined): string | null {
	if (!value) return null;
	if (!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(value) || value.length > POSTER_MAX_CHARS) {
		throw new EventError((t) => t.errors.videoPoster);
	}
	return value;
}

/**
 * Controlla che l'URL sia un video caricato su Blob PER QUESTO evento (non un link qualsiasi):
 * percorso giusto, tipo video, dimensione entro il limite.
 */
export async function verifyBlobVideo(url: string, eventId: string, kind: MediaKind = 'video') {
	const limits = LIMITS[kind];
	const invalid = () =>
		new EventError((t) => (kind === 'music' ? t.errors.musicInvalid : t.errors.videoInvalid));
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		throw invalid();
	}
	if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith('.blob.vercel-storage.com')) {
		throw invalid();
	}
	const info = await head(url).catch(() => null);
	if (
		!info ||
		!info.pathname.startsWith(blobPrefix(eventId)) ||
		!limits.types.includes(info.contentType) ||
		info.size > limits.max
	) {
		throw invalid();
	}
	return info.url;
}

/** Solo sviluppo: salva il file caricato in `.uploads/video/` e restituisce l'URL locale. */
export async function saveLocalVideo(
	file: FormDataEntryValue | null,
	eventId: string,
	kind: MediaKind = 'video'
) {
	const music = kind === 'music';
	if (!file || typeof file === 'string' || file.size === 0) {
		throw new EventError((t) => (music ? t.errors.musicMissing : t.errors.videoMissing));
	}
	if (file.size > LIMITS[kind].max) {
		throw new EventError((t) => (music ? t.errors.musicTooBig : t.errors.videoTooBig));
	}
	if (!LIMITS[kind].types.includes(file.type)) {
		throw new EventError((t) => (music ? t.errors.musicFormat : t.errors.videoFormat));
	}
	const name = `${eventId}-${createToken().slice(0, 12)}.${EXT[file.type]}`;
	await mkdir(LOCAL_DIR, { recursive: true });
	await writeFile(join(LOCAL_DIR, name), Buffer.from(await file.arrayBuffer()));
	return `${LOCAL_PREFIX}${name}`;
}

/** Cancella il video precedente (Blob o locale). Gli errori non bloccano l'operazione. */
export async function deleteVideo(url: string | null) {
	if (!url) return;
	try {
		if (url.startsWith(LOCAL_PREFIX)) {
			await unlink(join(LOCAL_DIR, url.slice(LOCAL_PREFIX.length)));
		} else if (BLOB_READ_WRITE_TOKEN) {
			await del(url);
		}
	} catch (err) {
		console.error('[video] cancellazione non riuscita', err);
	}
}
