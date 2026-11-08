/**
 * Estrazione del Secret Santa.
 *
 * Regole:
 * - nessuno pesca sé stesso;
 * - ognuno riceve esattamente un regalo;
 * - le coppie escluse non si pescano in nessuna direzione.
 *
 * Usa un backtracking su un ordine casuale: se esiste una soluzione la trova sempre,
 * altrimenti lancia `DrawImpossibleError` (es. esclusioni troppo restrittive).
 */

export type Exclusion = readonly [string, string];

/** Mappa giver → receiver. */
export type Assignments = Map<string, string>;

export class DrawImpossibleError extends Error {
	constructor(message = 'Impossibile completare l’estrazione con queste esclusioni.') {
		super(message);
		this.name = 'DrawImpossibleError';
	}
}

export type Rng = () => number;

function shuffle<T>(items: readonly T[], rng: Rng): T[] {
	const a = [...items];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

function exclusionKey(a: string, b: string) {
	return a < b ? `${a}\u0000${b}` : `${b}\u0000${a}`;
}

export function draw(
	participantIds: readonly string[],
	exclusions: readonly Exclusion[] = [],
	rng: Rng = Math.random
): Assignments {
	const ids = [...new Set(participantIds)];
	if (ids.length !== participantIds.length) {
		throw new Error('Partecipanti duplicati.');
	}
	if (ids.length < 3) {
		throw new DrawImpossibleError('Servono almeno 3 partecipanti.');
	}

	const blocked = new Set(exclusions.map(([a, b]) => exclusionKey(a, b)));
	const canGive = (giver: string, receiver: string) =>
		giver !== receiver && !blocked.has(exclusionKey(giver, receiver));

	// I più vincolati per primi: riduce drasticamente i rami del backtracking.
	const givers = shuffle(ids, rng).sort(
		(a, b) => ids.filter((r) => canGive(a, r)).length - ids.filter((r) => canGive(b, r)).length
	);

	const result: Assignments = new Map();
	const taken = new Set<string>();

	const solve = (index: number): boolean => {
		if (index === givers.length) return true;
		const giver = givers[index];
		for (const receiver of shuffle(ids, rng)) {
			if (taken.has(receiver) || !canGive(giver, receiver)) continue;
			result.set(giver, receiver);
			taken.add(receiver);
			if (solve(index + 1)) return true;
			result.delete(giver);
			taken.delete(receiver);
		}
		return false;
	};

	if (!solve(0)) throw new DrawImpossibleError();
	return result;
}
