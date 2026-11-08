import {
	date,
	foreignKey,
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
	uuid
} from 'drizzle-orm/pg-core';

export const event = pgTable('event', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	exchangeDate: date('exchange_date'),
	/** Budget in centesimi di euro. */
	budgetCents: integer('budget_cents'),
	message: text('message'),
	/** Token segreto con cui l'organizzatore gestisce l'evento. */
	adminToken: text('admin_token').notNull().unique(),
	drawnAt: timestamp('drawn_at', { withTimezone: true }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

/**
 * L'email NON è unica: più partecipanti possono condividerla
 * (es. la nonna senza email → `managedById` punta al nipote).
 */
export const participant = pgTable(
	'participant',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		eventId: uuid('event_id')
			.notNull()
			.references(() => event.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		email: text('email').notNull(),
		managedById: uuid('managed_by_id'),
		/** Token del link personale: mostra solo l'abbinamento di questa persona. */
		token: text('token').notNull().unique(),
		isOrganizer: integer('is_organizer').notNull().default(0),
		inviteSentAt: timestamp('invite_sent_at', { withTimezone: true }),
		inviteOpenedAt: timestamp('invite_opened_at', { withTimezone: true })
	},
	(t) => [foreignKey({ columns: [t.managedById], foreignColumns: [t.id] }).onDelete('set null')]
);

export const exclusion = pgTable(
	'exclusion',
	{
		eventId: uuid('event_id')
			.notNull()
			.references(() => event.id, { onDelete: 'cascade' }),
		aId: uuid('a_id')
			.notNull()
			.references(() => participant.id, { onDelete: 'cascade' }),
		bId: uuid('b_id')
			.notNull()
			.references(() => participant.id, { onDelete: 'cascade' })
	},
	(t) => [primaryKey({ columns: [t.aId, t.bId] })]
);

export const assignment = pgTable(
	'assignment',
	{
		eventId: uuid('event_id')
			.notNull()
			.references(() => event.id, { onDelete: 'cascade' }),
		giverId: uuid('giver_id')
			.notNull()
			.references(() => participant.id, { onDelete: 'cascade' }),
		receiverId: uuid('receiver_id')
			.notNull()
			.references(() => participant.id, { onDelete: 'cascade' })
	},
	(t) => [
		primaryKey({ columns: [t.giverId] }),
		uniqueIndex('assignment_receiver_unique').on(t.receiverId)
	]
);

export const wish = pgTable('wish', {
	id: uuid('id').primaryKey().defaultRandom(),
	participantId: uuid('participant_id')
		.notNull()
		.references(() => participant.id, { onDelete: 'cascade' }),
	text: text('text').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});
