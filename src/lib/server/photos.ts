import { EventError } from './events.ts';

/** Dopo il ridimensionamento nel browser una foto pesa ~50 KB: 1,5 MB lascia margine anche senza JS. */
export const MAX_PHOTO_BYTES = 1_500_000;

const SIGNATURES: { mime: string; test: (b: Uint8Array) => boolean }[] = [
	{ mime: 'image/jpeg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
	{
		mime: 'image/png',
		test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47
	},
	{
		mime: 'image/webp',
		test: (b) =>
			b[0] === 0x52 &&
			b[1] === 0x49 &&
			b[2] === 0x46 &&
			b[3] === 0x46 && // RIFF
			b[8] === 0x57 &&
			b[9] === 0x45 &&
			b[10] === 0x42 &&
			b[11] === 0x50 // WEBP
	}
];

export interface PhotoInput {
	mime: string;
	data: string; // base64
}

/**
 * Valida un file caricato guardando i byte reali (non il nome né il content-type dichiarato).
 * Restituisce null se non è stato scelto nessun file.
 */
export async function readPhoto(value: FormDataEntryValue | null): Promise<PhotoInput | null> {
	if (!value || typeof value === 'string' || value.size === 0) return null;
	if (value.size > MAX_PHOTO_BYTES) throw new EventError('La foto è troppo grande (max 1,5 MB).');

	const bytes = new Uint8Array(await value.arrayBuffer());
	const kind = SIGNATURES.find((s) => s.test(bytes));
	if (!kind) throw new EventError('Formato non supportato: usa una foto JPG, PNG o WebP.');

	return { mime: kind.mime, data: Buffer.from(bytes).toString('base64') };
}
