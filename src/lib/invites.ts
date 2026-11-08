import { getT, type Messages } from '#lib/i18n/index.ts';

/**
 * Calcolo degli inviti da spedire.
 *
 * Più partecipanti possono condividere la stessa email (es. la nonna senza email riceve
 * l'invito sulla mail del nipote): ogni partecipante ha comunque il PROPRIO invito e il
 * PROPRIO link segreto, con un oggetto che dice per chi è.
 */

export interface InviteParticipant {
	id: string;
	name: string;
	email: string;
	/** Partecipante che gestisce l'invito di questa persona (riceve la mail al suo posto). */
	managedById?: string | null;
	token: string;
}

export interface Invite {
	participantId: string;
	to: string;
	subject: string;
	/** Nome della persona a cui è destinato l'abbinamento. */
	forName: string;
	/** Nome di chi riceve materialmente la mail, se diverso. */
	managerName: string | null;
	token: string;
}

export function normalizeEmail(email: string) {
	return email.trim().toLowerCase();
}

/** `wishlist` = fase 1 (scrivi la lista), `draw` = fase 2 (apri la busta). */
export type InviteKind = 'wishlist' | 'draw';

function subjectFor(t: Messages, kind: InviteKind, name: string, managed: boolean) {
	const s = t.email.subjects;
	if (kind === 'wishlist') return managed ? s.wishlistManaged(name) : s.wishlist;
	return managed ? s.drawManaged(name) : s.draw;
}

export function buildInvites(
	participants: readonly InviteParticipant[],
	kind: InviteKind = 'draw',
	t: Messages = getT('it')
): Invite[] {
	const byId = new Map(participants.map((p) => [p.id, p]));

	return participants.map((p) => {
		const manager = p.managedById ? (byId.get(p.managedById) ?? null) : null;
		if (p.managedById && !manager) {
			throw new Error(`Gestore ${p.managedById} non trovato per ${p.name}.`);
		}
		return {
			participantId: p.id,
			to: normalizeEmail(manager ? manager.email : p.email),
			subject: subjectFor(t, kind, p.name, Boolean(manager)),
			forName: p.name,
			managerName: manager?.name ?? null,
			token: p.token
		};
	});
}
