import type { Handle } from '@sveltejs/kit/hooks';
import { fromAcceptLanguage, isLocale } from '#lib/i18n/index.ts';

/**
 * Lingua dell'interfaccia (pagina iniziale e pagine d'errore):
 * `?lang=es` (salvata in un cookie) → cookie → lingua del browser.
 * Le pagine di un evento usano invece la lingua dell'evento.
 */
export const handle: Handle = async ({ event, resolve }) => {
	const fromQuery = event.url.searchParams.get('lang');
	if (isLocale(fromQuery)) {
		event.cookies.set('lang', fromQuery, {
			path: '/',
			maxAge: 60 * 60 * 24 * 365,
			httpOnly: false,
			sameSite: 'lax'
		});
	}
	const fromCookie = event.cookies.get('lang');
	event.locals.locale = isLocale(fromQuery)
		? fromQuery
		: isLocale(fromCookie)
			? fromCookie
			: fromAcceptLanguage(event.request.headers.get('accept-language'));

	return resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace('<html lang="it">', `<html lang="${event.locals.locale}">`)
	});
};
