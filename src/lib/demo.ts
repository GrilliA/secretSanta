/**
 * Dati demo per sviluppare l'interfaccia prima di collegare il database.
 * Da sostituire con le query Drizzle (vedi `#lib/server/db`).
 */

export interface DemoParticipant {
	id: string;
	name: string;
	email: string;
	managedById?: string | null;
	isOrganizer?: boolean;
	token: string;
	wishes: string[];
}

export const demoEvent = {
	id: 'demo',
	name: 'Natale in famiglia 2026',
	exchangeDate: '25 dicembre',
	budget: '30 €',
	message: 'Ci vediamo dalla nonna per il pranzo!'
};

export const demoParticipants: DemoParticipant[] = [
	{
		id: 'alessio',
		name: 'Alessio',
		email: 'alessio@email.it',
		isOrganizer: true,
		token: 'demo-alessio',
		wishes: []
	},
	{
		id: 'nonna',
		name: 'Nonna Rosa',
		email: 'alessio@email.it',
		managedById: 'alessio',
		token: 'demo-nonna',
		wishes: []
	},
	{
		id: 'giulia',
		name: 'Giulia',
		email: 'giulia@email.it',
		token: 'demo-giulia',
		wishes: ['Un libro di ricette', 'Sciarpa di lana, colori scuri', 'Piante da appartamento']
	},
	{ id: 'marco', name: 'Marco', email: 'marco@email.it', token: 'demo-marco', wishes: [] }
];

export const demoExclusions: [string, string][] = [['giulia', 'marco']];

/** Abbinamenti fissi per la demo (giver → receiver). */
export const demoAssignments: Record<string, string> = {
	alessio: 'marco',
	nonna: 'giulia',
	giulia: 'alessio',
	marco: 'nonna'
};

export function findDemoByToken(token: string) {
	const me = demoParticipants.find((p) => p.token === token);
	if (!me) return null;
	const receiver = demoParticipants.find((p) => p.id === demoAssignments[me.id])!;
	const manager = me.managedById
		? (demoParticipants.find((p) => p.id === me.managedById) ?? null)
		: null;
	return { event: demoEvent, me, receiver, manager };
}
