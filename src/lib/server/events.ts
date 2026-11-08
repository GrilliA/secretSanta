import { and, asc, eq, inArray, isNull, or } from 'drizzle-orm';
import { draw, type Rng } from '#lib/draw.ts';
import { normalizeEmail, type InviteKind, type InviteParticipant } from '#lib/invites.ts';
import type { Db } from './db/index.ts';
import { assignment, event, exclusion, participant, photo, wish } from './db/schema.ts';
import type { PhotoInput } from './photos.ts';
import { createToken } from './token.ts';

/** Errore di dominio con messaggio mostrabile all'utente. */
export class EventError extends Error {
	constructor(
		message: string,
		readonly status = 400
	) {
		super(message);
		this.name = 'EventError';
	}
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requireText(value: string | null | undefined, label: string, max = 120) {
	const v = (value ?? '').trim();
	if (!v) throw new EventError(`${label}: campo obbligatorio.`);
	if (v.length > max) throw new EventError(`${label}: massimo ${max} caratteri.`);
	return v;
}

function requireEmail(value: string | null | undefined) {
	const v = normalizeEmail(value ?? '');
	if (!EMAIL_RE.test(v)) throw new EventError('Email non valida.');
	return v;
}

function optionalText(value: string | null | undefined, max = 500) {
	const v = (value ?? '').trim();
	return v ? v.slice(0, max) : null;
}

// ---------------------------------------------------------------- evento

export interface CreateEventInput {
	name: string;
	exchangeDate?: string | null;
	budget?: string | null;
	message?: string | null;
	organizerName: string;
	organizerEmail: string;
	organizerPlays: boolean;
}

export async function createEvent(db: Db, input: CreateEventInput) {
	const organizerName = requireText(input.organizerName, 'Il tuo nome', 60);
	const organizerEmail = requireEmail(input.organizerEmail);
	const exchangeDate = input.exchangeDate?.match(/^\d{4}-\d{2}-\d{2}$/) ? input.exchangeDate : null;

	const [created] = await db
		.insert(event)
		.values({
			name: requireText(input.name, 'Nome dell’evento'),
			exchangeDate,
			budget: optionalText(input.budget, 40),
			message: optionalText(input.message),
			organizerName,
			organizerEmail,
			adminToken: createToken()
		})
		.returning();

	if (input.organizerPlays) {
		await db.insert(participant).values({
			eventId: created.id,
			name: organizerName,
			email: organizerEmail,
			isOrganizer: true,
			token: createToken()
		});
	}
	return created;
}

/**
 * Vista dell'organizzatore. Per la regola di segretezza NON include i token dei partecipanti
 * (aprirebbero i loro abbinamenti) né gli abbinamenti.
 */
export async function getAdminView(db: Db, adminToken: string) {
	const [ev] = await db.select().from(event).where(eq(event.adminToken, adminToken));
	if (!ev) return null;

	const people = await db
		.select({
			id: participant.id,
			name: participant.name,
			email: participant.email,
			managedById: participant.managedById,
			isOrganizer: participant.isOrganizer,
			wishlistInvitedAt: participant.wishlistInvitedAt,
			wishlistReadyAt: participant.wishlistReadyAt,
			inviteSentAt: participant.inviteSentAt,
			inviteOpenedAt: participant.inviteOpenedAt,
			photoId: photo.id
		})
		.from(participant)
		.leftJoin(photo, eq(photo.participantId, participant.id))
		.where(eq(participant.eventId, ev.id))
		.orderBy(asc(participant.createdAt));

	const excl = await db
		.select({ aId: exclusion.aId, bId: exclusion.bId })
		.from(exclusion)
		.where(eq(exclusion.eventId, ev.id));

	const { adminToken: _omit, ...eventInfo } = ev;
	return { event: eventInfo, participants: people, exclusions: excl };
}

async function requireEditableEvent(db: Db, adminToken: string) {
	const [ev] = await db.select().from(event).where(eq(event.adminToken, adminToken));
	if (!ev) throw new EventError('Evento non trovato.', 404);
	if (ev.drawnAt)
		throw new EventError('L’estrazione è già stata fatta: non si può più modificare.');
	return ev;
}

// ---------------------------------------------------------- partecipanti

export interface AddParticipantInput {
	name: string;
	email?: string | null;
	managedById?: string | null;
	photo?: PhotoInput | null;
}

export async function addParticipant(db: Db, adminToken: string, input: AddParticipantInput) {
	const ev = await requireEditableEvent(db, adminToken);
	const name = requireText(input.name, 'Nome', 60);

	let email: string;
	let managedById: string | null = null;
	if (input.managedById) {
		const [manager] = await db
			.select()
			.from(participant)
			.where(and(eq(participant.id, input.managedById), eq(participant.eventId, ev.id)));
		if (!manager) throw new EventError('Chi gestisce l’invito non fa parte dell’evento.');
		if (manager.managedById) {
			throw new EventError(`${manager.name} ha già l’invito gestito da qualcun altro.`);
		}
		email = manager.email;
		managedById = manager.id;
	} else {
		email = requireEmail(input.email);
	}

	const [created] = await db
		.insert(participant)
		.values({ eventId: ev.id, name, email, managedById, token: createToken() })
		.returning({ id: participant.id });
	if (input.photo) await savePhoto(db, created.id, input.photo);
	// Una persona nuova non ha ancora la lista: l'avviso "tutte pronte" potrà ripartire.
	await db.update(event).set({ readyNotifiedAt: null }).where(eq(event.id, ev.id));
	return created;
}

// ------------------------------------------------------------------ foto

async function savePhoto(db: Db, participantId: string, input: PhotoInput) {
	// Sostituzione = nuova riga con nuovo id, così l'URL vecchio (in cache) non mostra la foto nuova.
	await db.delete(photo).where(eq(photo.participantId, participantId));
	await db.insert(photo).values({ participantId, mime: input.mime, data: input.data });
}

async function requireParticipantOfEvent(db: Db, adminToken: string, participantId: string) {
	const [row] = await db
		.select({ id: participant.id })
		.from(participant)
		.innerJoin(event, eq(event.id, participant.eventId))
		.where(and(eq(event.adminToken, adminToken), eq(participant.id, participantId)));
	if (!row) throw new EventError('Partecipante non trovato.', 404);
	return row;
}

/** Le foto si possono cambiare anche dopo l'estrazione: non influiscono sugli abbinamenti. */
export async function setPhoto(
	db: Db,
	adminToken: string,
	participantId: string,
	input: PhotoInput
) {
	await requireParticipantOfEvent(db, adminToken, participantId);
	await savePhoto(db, participantId, input);
}

export async function removePhoto(db: Db, adminToken: string, participantId: string) {
	await requireParticipantOfEvent(db, adminToken, participantId);
	await db.delete(photo).where(eq(photo.participantId, participantId));
}

export async function getPhoto(db: Db, photoId: string) {
	if (!/^[0-9a-f-]{36}$/i.test(photoId)) return null;
	const [row] = await db
		.select({ mime: photo.mime, data: photo.data })
		.from(photo)
		.where(eq(photo.id, photoId));
	return row ?? null;
}

export async function removeParticipant(db: Db, adminToken: string, participantId: string) {
	const ev = await requireEditableEvent(db, adminToken);
	// Chi era gestito da questa persona torna senza gestore: va ricollegato a mano.
	await db
		.delete(participant)
		.where(and(eq(participant.id, participantId), eq(participant.eventId, ev.id)));
}

// ------------------------------------------------------------ esclusioni

export async function addExclusion(db: Db, adminToken: string, a: string, b: string) {
	const ev = await requireEditableEvent(db, adminToken);
	if (!a || !b || a === b) throw new EventError('Scegli due persone diverse.');
	const found = await db
		.select({ id: participant.id })
		.from(participant)
		.where(and(eq(participant.eventId, ev.id), inArray(participant.id, [a, b])));
	if (found.length !== 2) throw new EventError('Persone non valide.');

	const [aId, bId] = a < b ? [a, b] : [b, a];
	await db.insert(exclusion).values({ eventId: ev.id, aId, bId }).onConflictDoNothing();
}

export async function removeExclusion(db: Db, adminToken: string, a: string, b: string) {
	const ev = await requireEditableEvent(db, adminToken);
	const [aId, bId] = a < b ? [a, b] : [b, a];
	await db
		.delete(exclusion)
		.where(and(eq(exclusion.eventId, ev.id), eq(exclusion.aId, aId), eq(exclusion.bId, bId)));
}

// ------------------------------------------------------------ estrazione

/**
 * Estrae gli abbinamenti e li salva. Restituisce i dati per spedire gli inviti
 * (token compresi: restano lato server).
 */
export async function runDraw(db: Db, adminToken: string, rng?: Rng) {
	const ev = await requireEditableEvent(db, adminToken);

	const people = await db.select().from(participant).where(eq(participant.eventId, ev.id));
	const excl = await db.select().from(exclusion).where(eq(exclusion.eventId, ev.id));

	// Lancia DrawImpossibleError se non c'è soluzione: nulla viene salvato.
	const result = draw(
		people.map((p) => p.id),
		excl.map((e) => [e.aId, e.bId] as const),
		rng
	);

	// "Prenota" l'estrazione in modo atomico: protegge da doppio clic / richieste concorrenti.
	const locked = await db
		.update(event)
		.set({ drawnAt: new Date() })
		.where(and(eq(event.id, ev.id), isNull(event.drawnAt)))
		.returning({ id: event.id });
	if (locked.length === 0) throw new EventError('L’estrazione è già stata fatta.');

	try {
		await db
			.insert(assignment)
			.values(
				[...result].map(([giverId, receiverId]) => ({ eventId: ev.id, giverId, receiverId }))
			);
	} catch (err) {
		await db.update(event).set({ drawnAt: null }).where(eq(event.id, ev.id));
		throw err;
	}

	const inviteParticipants: InviteParticipant[] = people.map((p) => ({
		id: p.id,
		name: p.name,
		email: p.email,
		managedById: p.managedById,
		token: p.token
	}));
	return { event: ev, participants: inviteParticipants };
}

/**
 * Dati per spedire inviti: fase "lista" prima dell'estrazione, fase "busta" dopo.
 * Con `onlyIds` si limita a quei partecipanti; con `onlyNotInvited` (fase lista) a chi non l'ha ancora ricevuto.
 */
export async function getInviteParticipants(
	db: Db,
	adminToken: string,
	options: { onlyIds?: string[]; onlyNotInvited?: boolean } = {}
) {
	const [ev] = await db.select().from(event).where(eq(event.adminToken, adminToken));
	if (!ev) throw new EventError('Evento non trovato.', 404);
	const people = await db.select().from(participant).where(eq(participant.eventId, ev.id));
	const kind: InviteKind = ev.drawnAt ? 'draw' : 'wishlist';

	const sendTo = people
		.filter((p) => !options.onlyIds || options.onlyIds.includes(p.id))
		.filter((p) => !(options.onlyNotInvited && kind === 'wishlist' && p.wishlistInvitedAt))
		.map((p) => p.id);
	if (kind === 'wishlist' && people.length === 0) {
		throw new EventError('Aggiungi prima qualche partecipante.');
	}

	return {
		event: ev,
		kind,
		participants: people.map((p) => ({
			id: p.id,
			name: p.name,
			email: p.email,
			managedById: p.managedById,
			token: p.token
		})),
		sendTo
	};
}

export async function markWishlistInvited(db: Db, participantIds: string[]) {
	if (participantIds.length === 0) return;
	await db
		.update(participant)
		.set({ wishlistInvitedAt: new Date() })
		.where(inArray(participant.id, participantIds));
}

export async function markInvitesSent(db: Db, participantIds: string[]) {
	if (participantIds.length === 0) return;
	await db
		.update(participant)
		.set({ inviteSentAt: new Date() })
		.where(inArray(participant.id, participantIds));
}

// ------------------------------------------------- vista del partecipante

export async function getInviteView(db: Db, token: string) {
	const [me] = await db.select().from(participant).where(eq(participant.token, token));
	if (!me) return null;

	const [ev] = await db.select().from(event).where(eq(event.id, me.eventId));
	const manager = me.managedById
		? ((await db.select().from(participant).where(eq(participant.id, me.managedById)))[0] ?? null)
		: null;

	const [assigned] = await db
		.select({ id: participant.id, name: participant.name, photoId: photo.id })
		.from(assignment)
		.innerJoin(participant, eq(participant.id, assignment.receiverId))
		.leftJoin(photo, eq(photo.participantId, participant.id))
		.where(eq(assignment.giverId, me.id));

	const wishes = await db
		.select({ id: wish.id, text: wish.text, participantId: wish.participantId })
		.from(wish)
		.where(
			assigned
				? or(eq(wish.participantId, me.id), eq(wish.participantId, assigned.id))
				: eq(wish.participantId, me.id)
		)
		.orderBy(asc(wish.createdAt));

	return {
		event: {
			name: ev.name,
			exchangeDate: ev.exchangeDate,
			budget: ev.budget,
			message: ev.message,
			organizerName: ev.organizerName
		},
		me: {
			id: me.id,
			name: me.name,
			ready: Boolean(me.wishlistReadyAt),
			wishes: wishes.filter((w) => w.participantId === me.id).map(({ id, text }) => ({ id, text }))
		},
		receiver: assigned
			? {
					name: assigned.name,
					photoId: assigned.photoId,
					wishes: wishes.filter((w) => w.participantId === assigned.id).map((w) => w.text)
				}
			: null,
		managerName: manager?.name ?? null,
		firstOpen: !me.inviteOpenedAt
	};
}

export async function markOpened(db: Db, participantId: string) {
	await db
		.update(participant)
		.set({ inviteOpenedAt: new Date() })
		.where(and(eq(participant.id, participantId), isNull(participant.inviteOpenedAt)));
}

const MAX_WISHES = 15;

export async function addWish(db: Db, token: string, text: string) {
	const [me] = await db.select().from(participant).where(eq(participant.token, token));
	if (!me) throw new EventError('Invito non trovato.', 404);
	const value = requireText(text, 'Desiderio', 140);
	const existing = await db.select({ id: wish.id }).from(wish).where(eq(wish.participantId, me.id));
	if (existing.length >= MAX_WISHES) throw new EventError(`Massimo ${MAX_WISHES} desideri.`);
	await db.insert(wish).values({ participantId: me.id, text: value });
}

export async function removeWish(db: Db, token: string, wishId: string) {
	const [me] = await db.select().from(participant).where(eq(participant.token, token));
	if (!me) throw new EventError('Invito non trovato.', 404);
	await db.delete(wish).where(and(eq(wish.id, wishId), eq(wish.participantId, me.id)));
}

// ------------------------------------------------------ lista pronta

/**
 * Il partecipante segna la sua lista come pronta (o la riapre).
 * Se ora TUTTE le liste sono pronte e l'estrazione non è ancora fatta, restituisce i dati per avvisare
 * l'organizzatore. L'avviso parte una volta sola (aggiornamento condizionale su `readyNotifiedAt`).
 */
export async function setWishlistReady(db: Db, token: string, ready: boolean) {
	const [me] = await db.select().from(participant).where(eq(participant.token, token));
	if (!me) throw new EventError('Invito non trovato.', 404);

	await db
		.update(participant)
		.set({ wishlistReadyAt: ready ? new Date() : null })
		.where(eq(participant.id, me.id));
	if (!ready) return { notifyOrganizer: null, count: 0 };

	const people = await db
		.select({ ready: participant.wishlistReadyAt })
		.from(participant)
		.where(eq(participant.eventId, me.eventId));
	if (people.some((p) => !p.ready)) return { notifyOrganizer: null, count: people.length };

	const [ev] = await db
		.update(event)
		.set({ readyNotifiedAt: new Date() })
		.where(and(eq(event.id, me.eventId), isNull(event.readyNotifiedAt), isNull(event.drawnAt)))
		.returning();
	return { notifyOrganizer: ev ?? null, count: people.length };
}
