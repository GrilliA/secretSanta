/**
 * Prepara una foto nel browser prima dell'invio: ritaglio quadrato al centro (leggermente spostato
 * verso l'alto, dove di solito c'è il viso), ridimensionamento a 512 px e conversione in JPEG.
 * Così il file pesa ~50 KB e i metadati (es. posizione GPS) vengono scartati.
 */
export async function preparePhoto(file: File, size = 512): Promise<File> {
	const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
	const side = Math.min(bitmap.width, bitmap.height);
	const sx = (bitmap.width - side) / 2;
	// Nelle foto verticali il viso è in alto: spostiamo il ritaglio verso l'alto.
	const sy = bitmap.height > bitmap.width ? (bitmap.height - side) * 0.25 : 0;

	const canvas = document.createElement('canvas');
	canvas.width = canvas.height = size;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Canvas non disponibile');
	ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size);
	bitmap.close();

	const blob = await new Promise<Blob | null>((resolve) =>
		canvas.toBlob(resolve, 'image/jpeg', 0.85)
	);
	if (!blob) throw new Error('Conversione non riuscita');
	return new File([blob], 'foto.jpg', { type: 'image/jpeg' });
}

/** Sostituisce il file selezionato in un <input type="file"> con quello preparato. */
export function replaceInputFile(input: HTMLInputElement, file: File) {
	const dt = new DataTransfer();
	dt.items.add(file);
	input.files = dt.files;
}
