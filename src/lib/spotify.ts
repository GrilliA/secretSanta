/** Tipi di contenuto Spotify che si possono incorporare. */
const TYPES = ['track', 'album', 'playlist', 'episode', 'show'] as const;
const ID = /^[A-Za-z0-9]{22}$/;

/**
 * Riconosce un brano/album/playlist di Spotify da quello che incolla l'organizzatore:
 * link (`open.spotify.com/...`, anche `/intl-it/` o `/embed/`), codice `<iframe>` o URI `spotify:track:...`.
 * Restituisce `"<tipo>/<id>"` (es. `track/7Lmix...`) oppure null.
 */
export function parseSpotify(input: string | null | undefined): string | null {
	const text = input?.trim();
	if (!text) return null;

	const uri = text.match(/spotify:(track|album|playlist|episode|show):([A-Za-z0-9]{22})/);
	if (uri) return `${uri[1]}/${uri[2]}`;

	const src = text.match(/src=["']([^"']+)["']/)?.[1] ?? text;
	let url: URL;
	try {
		url = new URL(src.startsWith('http') ? src : `https://${src}`);
	} catch {
		return null;
	}
	if (url.hostname !== 'open.spotify.com') return null;
	const parts = url.pathname.split('/').filter((p) => p && p !== 'embed' && !p.startsWith('intl-'));
	const [type, id] = parts;
	if (!(TYPES as readonly string[]).includes(type) || !ID.test(id ?? '')) return null;
	return `${type}/${id}`;
}

/** URL dell'iframe ufficiale di Spotify per un valore salvato da `parseSpotify`. */
export function spotifyEmbedUrl(value: string) {
	return `https://open.spotify.com/embed/${value}?utm_source=generator&theme=0`;
}
