import {
	boolean,
	date,
	foreignKey,
	index,
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
	/** Budget così come scritto dall'organizzatore (es. "30 €"). */
	budget: text('budget'),
	message: text('message'),
	organizerName: text('organizer_name').notNull(),
	organizerEmail: text('organizer_email').notNull(),
	/** Token segreto con cui l'organizzatore gestisce l'evento (link /evento/[adminToken]). */
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
		isOrganizer: boolean('is_organizer').notNull().default(false),
		inviteSentAt: timestamp('invite_sent_at', { withTimezone: true }),
		inviteOpenedAt: timestamp('invite_opened_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [
		foreignKey({ columns: [t.managedById], foreignColumns: [t.id] }).onDelete('set null'),
		index('participant_event_idx').on(t.eventId)
	]
);

/** Coppia che non deve pescarsi. Salvata con `aId < bId` per evitare duplicati. */
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
	(t) => [primaryKey({ columns: [t.aId, t.bId] }), index('exclusion_event_idx').on(t.eventId)]
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

export const wish = pgTable(
	'wish',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		participantId: uuid('participant_id')
			.notNull()
			.references(() => participant.id, { onDelete: 'cascade' }),
		text: text('text').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [index('wish_participant_idx').on(t.participantId)]
);
