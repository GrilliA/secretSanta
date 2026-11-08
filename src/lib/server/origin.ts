import { APP_URL } from '$app/env/private';

/** Base dei link nelle email: APP_URL se impostata, altrimenti l'origine della richiesta. */
export function appOrigin(url: URL) {
	return (APP_URL ?? url.origin).replace(/\/+$/, '');
}
