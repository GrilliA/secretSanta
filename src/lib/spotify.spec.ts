import { describe, expect, it } from 'vitest';
import { parseSpotify } from './spotify.ts';

const ID = '7LmixnRetIvGlllHKIdMZ1';

describe('parseSpotify', () => {
	it('legge link, codice iframe e URI', () => {
		expect(parseSpotify(`https://open.spotify.com/track/${ID}?si=abc`)).toBe(`track/${ID}`);
		expect(parseSpotify(`https://open.spotify.com/intl-it/track/${ID}`)).toBe(`track/${ID}`);
		expect(parseSpotify(`open.spotify.com/playlist/${ID}`)).toBe(`playlist/${ID}`);
		expect(
			parseSpotify(
				`<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/${ID}?utm_source=generator&si=cd" width="100%" height="352"></iframe>`
			)
		).toBe(`track/${ID}`);
		expect(parseSpotify(`spotify:album:${ID}`)).toBe(`album/${ID}`);
	});

	it('rifiuta tutto il resto', () => {
		expect(parseSpotify('')).toBeNull();
		expect(parseSpotify('ciao')).toBeNull();
		expect(parseSpotify(`https://evil.example/track/${ID}`)).toBeNull();
		expect(parseSpotify('https://open.spotify.com/track/corto')).toBeNull();
		expect(parseSpotify(`https://open.spotify.com/artist/${ID}`)).toBeNull();
	});
});
