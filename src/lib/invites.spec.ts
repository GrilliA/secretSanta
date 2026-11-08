import { describe, expect, it } from 'vitest';
import { buildInvites } from './invites';

describe('buildInvites', () => {
	const participants = [
		{ id: 'a', name: 'Alessio', email: 'Alessio@Email.it ', token: 't-a' },
		{ id: 'r', name: 'Nonna Rosa', email: 'alessio@email.it', managedById: 'a', token: 't-r' },
		{ id: 'g', name: 'Giulia', email: 'giulia@email.it', token: 't-g' }
	];

	it('crea un invito separato per ogni partecipante, anche con email condivisa', () => {
		const invites = buildInvites(participants);
		expect(invites).toHaveLength(3);
		expect(invites.filter((i) => i.to === 'alessio@email.it')).toHaveLength(2);
		expect(new Set(invites.map((i) => i.token)).size).toBe(3);
	});

	it('usa un oggetto che dice per chi è l’invito gestito', () => {
		const nonna = buildInvites(participants).find((i) => i.participantId === 'r');
		expect(nonna?.subject).toBe('Il Secret Santa di Nonna Rosa');
		expect(nonna?.managerName).toBe('Alessio');
	});

	it('segnala un gestore inesistente', () => {
		expect(() =>
			buildInvites([{ id: 'x', name: 'X', email: 'x@x.it', managedById: 'nope', token: 't' }])
		).toThrow();
	});

	it('nella fase lista usa oggetti dedicati', () => {
		const invites = buildInvites(participants, 'wishlist');
		expect(invites.find((i) => i.participantId === 'r')?.subject).toBe(
			'Scrivi la lista dei desideri di Nonna Rosa'
		);
		expect(invites.find((i) => i.participantId === 'g')?.subject).toBe(
			'Scrivi la tua lista dei desideri'
		);
	});
});
