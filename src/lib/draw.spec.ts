import { describe, expect, it } from 'vitest';
import { draw, DrawImpossibleError, type Exclusion } from './draw';

/** RNG deterministico (mulberry32) per test riproducibili. */
function seeded(seed: number) {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const family = ['alessio', 'nonna', 'giulia', 'marco', 'sara'];

function assertValid(ids: string[], result: Map<string, string>, exclusions: Exclusion[] = []) {
	expect(result.size).toBe(ids.length);
	expect(new Set(result.values()).size).toBe(ids.length);
	for (const [giver, receiver] of result) {
		expect(giver).not.toBe(receiver);
		for (const [a, b] of exclusions) {
			expect([giver, receiver].sort()).not.toEqual([a, b].sort());
		}
	}
}

describe('draw', () => {
	it('assegna a ognuno un destinatario diverso da sé', () => {
		for (let seed = 1; seed <= 200; seed++) {
			assertValid(family, draw(family, [], seeded(seed)));
		}
	});

	it('rispetta le esclusioni in entrambe le direzioni', () => {
		const exclusions: Exclusion[] = [
			['giulia', 'marco'],
			['alessio', 'nonna']
		];
		for (let seed = 1; seed <= 200; seed++) {
			assertValid(family, draw(family, exclusions, seeded(seed)), exclusions);
		}
	});

	it('è deterministica a parità di seed', () => {
		expect([...draw(family, [], seeded(42))]).toEqual([...draw(family, [], seeded(42))]);
	});

	it('produce estrazioni diverse con seed diversi', () => {
		const results = new Set(
			Array.from({ length: 30 }, (_, i) => JSON.stringify([...draw(family, [], seeded(i + 1))]))
		);
		expect(results.size).toBeGreaterThan(1);
	});

	it('fallisce con meno di 3 partecipanti', () => {
		expect(() => draw(['a', 'b'])).toThrow(DrawImpossibleError);
	});

	it('fallisce se le esclusioni rendono impossibile l’estrazione', () => {
		// "a" non può fare il regalo a nessuno.
		expect(() =>
			draw(
				['a', 'b', 'c'],
				[
					['a', 'b'],
					['a', 'c']
				]
			)
		).toThrow(DrawImpossibleError);
	});

	it('rifiuta partecipanti duplicati', () => {
		expect(() => draw(['a', 'a', 'b'])).toThrow();
	});
});
