import { describe, expect, it } from 'vitest';
import { buildInvites } from '#lib/invites.ts';
import { formatDay } from '#lib/format.ts';
import { fromAcceptLanguage, getT, toLocale } from './index.ts';
import { it as itMessages } from './it.ts';
import { es } from './es.ts';

/** Tutte le chiavi (anche annidate) di un dizionario, per confrontare le due lingue. */
function keys(obj: object, prefix = ''): string[] {
	return Object.entries(obj).flatMap(([k, v]) =>
		v && typeof v === 'object' && !Array.isArray(v) ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]
	);
}

describe('i18n', () => {
	it('spagnolo e italiano hanno le stesse chiavi', () => {
		expect(keys(es).sort()).toEqual(keys(itMessages).sort());
	});

	it('nessun testo spagnolo è rimasto uguale a quello italiano (salvo nomi propri)', () => {
		const same = keys(itMessages).filter((k) => {
			const get = (o: object) => k.split('.').reduce<unknown>((x, p) => (x as never)[p], o);
			const a = get(itMessages);
			const b = get(es);
			return typeof a === 'string' && a === b;
		});
		expect(same.sort()).toEqual(['admin.email', 'admin.person', 'admin.photo']);
	});

	it('sceglie la lingua giusta', () => {
		expect(toLocale('es')).toBe('es');
		expect(toLocale('fr')).toBe('it');
		expect(fromAcceptLanguage('es-ES,es;q=0.9,en;q=0.8')).toBe('es');
		expect(fromAcceptLanguage('en-US,en;q=0.9')).toBe('it');
		expect(fromAcceptLanguage(null)).toBe('it');
	});

	it('oggetti delle email in spagnolo', () => {
		const people = [
			{ id: 'a', name: 'Alessio', email: 'a@a.es', token: 't1' },
			{ id: 'n', name: 'Ana', email: 'a@a.es', managedById: 'a', token: 't2' }
		];
		const t = getT('es');
		expect(buildInvites(people, 'wishlist', t).map((i) => i.subject)).toEqual([
			'Escribe tu lista de deseos',
			'Escribe la lista de deseos de Ana'
		]);
		expect(buildInvites(people, 'draw', t).map((i) => i.subject)).toEqual([
			'Tu Amigo Invisible',
			'El Amigo Invisible de Ana'
		]);
	});

	it('date nella lingua dell’evento', () => {
		expect(formatDay('2026-12-25', 'es-ES')).toBe('25 de diciembre');
		expect(formatDay('2026-12-25')).toBe('25 dicembre');
	});
});
