import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { DrawImpossibleError } from '#lib/draw.ts';
import { buildInvites } from '#lib/invites.ts';
import type { Db } from './db/index.ts';
import {
	addExclusion,
	addParticipant,
	addWish,
	createEvent,
	EventError,
	getAdminView,
	getInviteView,
	getPhoto,
	removePhoto,
	setPhoto,
	removeParticipant,
	removeWish,
	runDraw,
	setWishlistReady,
	getInviteParticipants,
	markWishlistInvited
} from './events.ts';
import { readPhoto } from './photos.ts';
import { createTestDb, resetTestDb } from './test-db.ts';

let db: Db;
let admin: string;

async function setupFamily() {
	const ev = await createEvent(db, {
		name: 'Natale in famiglia',
		exchangeDate: '2026-12-25',
		budget: '30 €',
		organizerName: 'Alessio',
		organizerEmail: 'Alessio@Email.it',
		organizerPlays: true
	});
	admin = ev.adminToken;
	const view = await getAdminView(db, admin);
	const alessio = view!.participants[0];
	const nonna = await addParticipant(db, admin, { name: 'Nonna Rosa', managedById: alessio.id });
	const giulia = await addParticipant(db, admin, { name: 'Giulia', email: 'giulia@email.it' });
	const marco = await addParticipant(db, admin, { name: 'Marco', email: 'marco@email.it' });
	return { alessio, nonna, giulia, marco };
}

beforeAll(async () => {
	db = await createTestDb();
}, 30_000);

beforeEach(async () => {
	await resetTestDb(db);
});

describe('evento e partecipanti', () => {
	it('crea l’evento con l’organizzatore come partecipante', async () => {
		await setupFamily();
		const view = await getAdminView(db, admin);
		expect(view?.event.name).toBe('Natale in famiglia');
		expect(view?.participants.map((p) => p.name)).toEqual([
			'Alessio',
			'Nonna Rosa',
			'Giulia',
			'Marco'
		]);
		expect(view?.participants[0]).toMatchObject({ isOrganizer: true, email: 'alessio@email.it' });
	});

	it('un partecipante gestito usa l’email del gestore', async () => {
		const { alessio } = await setupFamily();
		const view = await getAdminView(db, admin);
		const nonna = view!.participants.find((p) => p.name === 'Nonna Rosa')!;
		expect(nonna.email).toBe('alessio@email.it');
		expect(nonna.managedById).toBe(alessio.id);
	});

	it('la vista admin non espone token né abbinamenti', async () => {
		await setupFamily();
		await runDraw(db, admin);
		const view = await getAdminView(db, admin);
		const json = JSON.stringify(view);
		expect(json).not.toMatch(/token/i);
		expect(view).not.toHaveProperty('assignments');
	});

	it('rifiuta email non valide', async () => {
		await setupFamily();
		await expect(addParticipant(db, admin, { name: 'X', email: 'non-una-mail' })).rejects.toThrow(
			EventError
		);
	});
});

describe('estrazione', () => {
	it('salva gli abbinamenti e blocca le modifiche', async () => {
		await setupFamily();
		const { participants } = await runDraw(db, admin);
		expect(participants).toHaveLength(4);

		await expect(addParticipant(db, admin, { name: 'Sara', email: 's@s.it' })).rejects.toThrow(
			/già stata fatta/
		);
		await expect(runDraw(db, admin)).rejects.toThrow(EventError);
	});

	it('ognuno vede solo il proprio abbinamento, sempre valido', async () => {
		await setupFamily();
		const { participants } = await runDraw(db, admin);
		const receivers = new Set<string>();
		for (const p of participants) {
			const view = await getInviteView(db, p.token);
			expect(view?.receiver).not.toBeNull();
			expect(view!.receiver!.name).not.toBe(p.name);
			receivers.add(view!.receiver!.name);
		}
		expect(receivers.size).toBe(4);
	});

	it('rispetta le esclusioni', async () => {
		for (let i = 0; i < 10; i++) {
			const ids = await setupFamily();
			await addExclusion(db, admin, ids.giulia.id, ids.marco.id);
			const { participants } = await runDraw(db, admin);
			const g = participants.find((p) => p.name === 'Giulia')!;
			const m = participants.find((p) => p.name === 'Marco')!;
			expect((await getInviteView(db, g.token))?.receiver?.name).not.toBe('Marco');
			expect((await getInviteView(db, m.token))?.receiver?.name).not.toBe('Giulia');
		}
	});

	it('se è impossibile non salva nulla e si può riprovare', async () => {
		const ev = await createEvent(db, {
			name: 'Piccolo',
			organizerName: 'A',
			organizerEmail: 'a@a.it',
			organizerPlays: true
		});
		const a = (await getAdminView(db, ev.adminToken))!.participants[0];
		const b = await addParticipant(db, ev.adminToken, { name: 'B', email: 'b@b.it' });
		const c = await addParticipant(db, ev.adminToken, { name: 'C', email: 'c@c.it' });
		await addExclusion(db, ev.adminToken, a.id, b.id);
		await addExclusion(db, ev.adminToken, a.id, c.id);

		await expect(runDraw(db, ev.adminToken)).rejects.toThrow(DrawImpossibleError);
		const view = await getAdminView(db, ev.adminToken);
		expect(view?.event.drawnAt).toBeNull();
		// Si può ancora modificare.
		await removeParticipant(db, ev.adminToken, c.id);
	});

	it('gli inviti della nonna arrivano al gestore con oggetto dedicato', async () => {
		await setupFamily();
		const { participants } = await runDraw(db, admin);
		const invites = buildInvites(participants);
		const toAlessio = invites.filter((i) => i.to === 'alessio@email.it');
		expect(toAlessio.map((i) => i.subject).sort()).toEqual([
			'Il Secret Santa di Nonna Rosa',
			'Il tuo Secret Santa'
		]);
	});
});

describe('vista partecipante e desideri', () => {
	it('prima dell’estrazione non c’è destinatario', async () => {
		await setupFamily();
		const { participants } = await (async () => {
			// token letti direttamente: la vista admin non li espone
			const rows = await db.query.participant.findMany();
			return { participants: rows };
		})();
		const view = await getInviteView(db, participants[1].token);
		expect(view?.receiver).toBeNull();
		expect(view?.managerName).toBe('Alessio');
	});

	it('i desideri del destinatario sono visibili a chi gli fa il regalo', async () => {
		await setupFamily();
		const { participants } = await runDraw(db, admin);
		const giver = participants[0];
		const giverView = await getInviteView(db, giver.token);
		const receiver = participants.find((p) => p.name === giverView!.receiver!.name)!;

		await addWish(db, receiver.token, 'Sciarpa di lana');
		expect((await getInviteView(db, giver.token))?.receiver?.wishes).toEqual(['Sciarpa di lana']);

		const mine = (await getInviteView(db, receiver.token))!.me.wishes;
		await removeWish(db, receiver.token, mine[0].id);
		expect((await getInviteView(db, giver.token))?.receiver?.wishes).toEqual([]);
	});

	it('un token non può cancellare i desideri di un altro', async () => {
		await setupFamily();
		const { participants } = await runDraw(db, admin);
		await addWish(db, participants[0].token, 'Libro');
		const wishId = (await getInviteView(db, participants[0].token))!.me.wishes[0].id;
		await removeWish(db, participants[1].token, wishId);
		expect((await getInviteView(db, participants[0].token))!.me.wishes).toHaveLength(1);
	});

	it('token sconosciuto → null', async () => {
		expect(await getInviteView(db, 'nope')).toBeNull();
	});
});

// JPEG minimo: basta la firma iniziale per la validazione.
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46]);
const jpegFile = () => new File([JPEG], 'nonna.jpg', { type: 'image/jpeg' });

describe('foto', () => {
	it('valida i byte reali del file', async () => {
		expect(await readPhoto(null)).toBeNull();
		expect(await readPhoto(new File([], 'vuoto.jpg'))).toBeNull();
		expect(await readPhoto(jpegFile())).toMatchObject({ mime: 'image/jpeg' });
		await expect(
			readPhoto(new File(['<svg onload=alert(1)>'], 'x.jpg', { type: 'image/jpeg' }))
		).rejects.toThrow(EventError);
		await expect(readPhoto(new File([new Uint8Array(2_000_000)], 'big.jpg'))).rejects.toThrow(
			/troppo grande/
		);
	});

	it('si aggiunge con il partecipante e chi lo pesca vede il suo viso', async () => {
		await setupFamily();
		const photoInput = await readPhoto(jpegFile());
		await addParticipant(db, admin, { name: 'Sara', email: 's@s.it', photo: photoInput });

		const view = await getAdminView(db, admin);
		const sara = view!.participants.find((p) => p.name === 'Sara')!;
		expect(sara.photoId).toBeTruthy();
		expect(view!.participants.find((p) => p.name === 'Giulia')!.photoId).toBeNull();

		const { participants } = await runDraw(db, admin);
		for (const p of participants) {
			const inv = await getInviteView(db, p.token);
			if (inv?.receiver?.name === 'Sara') expect(inv.receiver.photoId).toBe(sara.photoId);
		}
		const stored = await getPhoto(db, sara.photoId!);
		expect(Buffer.from(stored!.data, 'base64')).toEqual(Buffer.from(JPEG));
	});

	it('sostituire la foto cambia id; si può rimuovere; solo per partecipanti dell’evento', async () => {
		const { nonna } = await setupFamily();
		const input = (await readPhoto(jpegFile()))!;
		await setPhoto(db, admin, nonna.id, input);
		const first = (await getAdminView(db, admin))!.participants.find((p) => p.id === nonna.id)!;
		await setPhoto(db, admin, nonna.id, input);
		const second = (await getAdminView(db, admin))!.participants.find((p) => p.id === nonna.id)!;
		expect(second.photoId).not.toBe(first.photoId);
		expect(await getPhoto(db, first.photoId!)).toBeNull();

		await removePhoto(db, admin, nonna.id);
		expect(
			(await getAdminView(db, admin))!.participants.find((p) => p.id === nonna.id)!.photoId
		).toBeNull();

		const other = await createEvent(db, {
			name: 'Altro',
			organizerName: 'Z',
			organizerEmail: 'z@z.it',
			organizerPlays: true
		});
		await expect(setPhoto(db, other.adminToken, nonna.id, input)).rejects.toThrow(EventError);
	});

	it('id non validi non fanno query', async () => {
		expect(await getPhoto(db, 'nope')).toBeNull();
	});
});

describe('fase lista dei desideri', () => {
	async function tokens() {
		return (await db.query.participant.findMany()).map((p) => p.token);
	}

	it('prima dell’estrazione gli inviti sono della fase lista, solo per chi non li ha ricevuti', async () => {
		await setupFamily();
		const first = await getInviteParticipants(db, admin, { onlyNotInvited: true });
		expect(first.kind).toBe('wishlist');
		expect(first.sendTo).toHaveLength(4);

		await markWishlistInvited(db, first.sendTo.slice(0, 2));
		const again = await getInviteParticipants(db, admin, { onlyNotInvited: true });
		expect(again.sendTo).toHaveLength(2);

		await runDraw(db, admin);
		expect((await getInviteParticipants(db, admin)).kind).toBe('draw');
	});

	it('avvisa l’organizzatore una sola volta, quando l’ultima lista è pronta', async () => {
		await setupFamily();
		const all = await tokens();
		for (const t of all.slice(0, -1)) {
			expect((await setWishlistReady(db, t, true)).notifyOrganizer).toBeNull();
		}
		const last = await setWishlistReady(db, all.at(-1)!, true);
		expect(last.notifyOrganizer?.adminToken).toBe(admin);
		expect(last.count).toBe(4);

		// Riaprire e richiudere una lista non manda un secondo avviso.
		await setWishlistReady(db, all[0], false);
		expect((await setWishlistReady(db, all[0], true)).notifyOrganizer).toBeNull();
	});

	it('una persona aggiunta dopo l’avviso fa ripartire l’attesa', async () => {
		await setupFamily();
		for (const t of await tokens()) await setWishlistReady(db, t, true);

		await addParticipant(db, admin, { name: 'Sara', email: 's@s.it' });
		const sara = (await db.query.participant.findMany()).find((p) => p.name === 'Sara')!;
		expect((await setWishlistReady(db, sara.token, true)).notifyOrganizer).not.toBeNull();
	});

	it('dopo l’estrazione non avvisa più', async () => {
		await setupFamily();
		const all = await tokens();
		for (const t of all.slice(0, -1)) await setWishlistReady(db, t, true);
		await runDraw(db, admin);
		expect((await setWishlistReady(db, all.at(-1)!, true)).notifyOrganizer).toBeNull();
	});

	it('la vista del partecipante espone lo stato "pronta"', async () => {
		await setupFamily();
		const [t] = await tokens();
		expect((await getInviteView(db, t))?.me.ready).toBe(false);
		await setWishlistReady(db, t, true);
		expect((await getInviteView(db, t))?.me.ready).toBe(true);
	});
});

describe('lingua dell’evento', () => {
	it('salva la lingua e traduce gli errori', async () => {
		const ev = await createEvent(db, {
			name: 'Navidad',
			organizerName: 'Ana',
			organizerEmail: 'ana@a.es',
			organizerPlays: true,
			locale: 'es'
		});
		const { localeForAdmin, localeForToken } = await import('./events.ts');
		expect(await localeForAdmin(db, ev.adminToken)).toBe('es');
		const [p] = await db.query.participant.findMany();
		expect(await localeForToken(db, p.token)).toBe('es');
		expect((await getInviteView(db, p.token))?.event.locale).toBe('es');

		const err = await addParticipant(db, ev.adminToken, { name: 'X', email: 'nope' }).catch(
			(e) => e
		);
		const { getT } = await import('#lib/i18n/index.ts');
		expect(err.render(getT('es'))).toBe('Email no válido.');
		expect(err.message).toBe('Email non valida.');
	});

	it('lingua sconosciuta → italiano', async () => {
		const ev = await createEvent(db, {
			name: 'X',
			organizerName: 'A',
			organizerEmail: 'a@a.it',
			organizerPlays: false,
			locale: 'fr'
		});
		const { localeForAdmin } = await import('./events.ts');
		expect(await localeForAdmin(db, ev.adminToken)).toBe('it');
	});
});

describe('lista dei partecipanti nell’invito', () => {
	it('mostra chi gioca con foto e stato, senza dati sensibili', async () => {
		await setupFamily();
		const [first, second] = await db.query.participant.findMany();
		await setWishlistReady(db, second.token, true);
		const view = await getInviteView(db, first.token);

		expect(view?.players.map((p) => p.name)).toEqual(['Alessio', 'Nonna Rosa', 'Giulia', 'Marco']);
		expect(view?.players.filter((p) => p.isMe).map((p) => p.name)).toEqual([first.name]);
		expect(view?.players.find((p) => p.name === second.name)?.ready).toBe(true);
		expect(Object.keys(view!.players[0]).sort()).toEqual(['isMe', 'name', 'photoId', 'ready']);
	});

	it('dopo l’estrazione la lista non rivela chi ha pescato chi', async () => {
		await setupFamily();
		const { participants } = await runDraw(db, admin);
		const view = await getInviteView(db, participants[0].token);
		const json = JSON.stringify(view?.players);
		expect(json).not.toMatch(/receiver|giver|token|email/i);
	});
});
