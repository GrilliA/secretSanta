import { fail } from '@sveltejs/kit';
import { DrawImpossibleError } from '#lib/draw.ts';
import { getT, type Locale } from '#lib/i18n/index.ts';
import { EventError } from './events.ts';

/**
 * Esegue un'azione e trasforma gli errori di dominio in `fail()` con un messaggio
 * nella lingua dell'evento. La lingua si calcola solo se serve (in caso di errore).
 * Gli altri errori risalgono (pagina d'errore + log).
 */
export async function guard<T>(fn: () => Promise<T>, locale: () => Promise<Locale> | Locale) {
	try {
		return await fn();
	} catch (err) {
		if (err instanceof EventError) {
			return fail(err.status, { error: err.render(getT(await locale())) });
		}
		if (err instanceof DrawImpossibleError) {
			const t = getT(await locale());
			return fail(400, {
				error: err.reason === 'tooFew' ? t.errors.needThree : t.errors.drawImpossible
			});
		}
		throw err;
	}
}

export function field(data: FormData, name: string) {
	const v = data.get(name);
	return typeof v === 'string' ? v : '';
}
