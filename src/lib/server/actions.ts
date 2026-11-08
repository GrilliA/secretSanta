import { fail } from '@sveltejs/kit';
import { DrawImpossibleError } from '#lib/draw.ts';
import { EventError } from './events.ts';

/**
 * Esegue un'azione e trasforma gli errori di dominio in `fail()` con un messaggio leggibile.
 * Gli altri errori risalgono (pagina d'errore + log).
 */
export async function guard<T>(fn: () => Promise<T>) {
	try {
		return await fn();
	} catch (err) {
		if (err instanceof EventError) return fail(err.status, { error: err.message });
		if (err instanceof DrawImpossibleError) return fail(400, { error: err.message });
		throw err;
	}
}

export function field(data: FormData, name: string) {
	const v = data.get(name);
	return typeof v === 'string' ? v : '';
}
