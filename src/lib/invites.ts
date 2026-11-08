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

export function buildInvites(participants: readonly InviteParticipant[]): Invite[] {
	const byId = new Map(participants.map((p) => [p.id, p]));

	return participants.map((p) => {
		const manager = p.managedById ? (byId.get(p.managedById) ?? null) : null;
		if (p.managedById && !manager) {
			throw new Error(`Gestore ${p.managedById} non trovato per ${p.name}.`);
		}
		return {
			participantId: p.id,
			to: normalizeEmail(manager ? manager.email : p.email),
			subject: manager ? `Il Secret Santa di ${p.name}` : 'Il tuo Secret Santa',
			forName: p.name,
			managerName: manager?.name ?? null,
			token: p.token
		};
	});
}
