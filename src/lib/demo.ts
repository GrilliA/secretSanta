/** Dati di esempio per l'anteprima delle email (`/anteprima/email`, solo in sviluppo). */

export const demoEvent = {
	name: 'Natale in famiglia 2026',
	exchangeDate: '25 dicembre',
	budget: '30 €'
};

export const demoParticipants = [
	{ id: 'alessio', name: 'Alessio', email: 'alessio@email.it', token: 'demo-alessio' },
	{
		id: 'nonna',
		name: 'Nonna Rosa',
		email: 'alessio@email.it',
		managedById: 'alessio',
		token: 'demo-nonna'
	},
	{ id: 'giulia', name: 'Giulia', email: 'giulia@email.it', token: 'demo-giulia' }
];
