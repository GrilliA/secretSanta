/** Testi italiani. È il dizionario di riferimento: `es.ts` deve avere la stessa forma. */
export const it = {
	locale: 'it',
	intlLocale: 'it-IT',
	languageName: 'Italiano',

	common: {
		add: 'Aggiungi',
		wait: 'Un attimo…',
		budget: 'Budget',
		exchangeOn: (day: string) => `Scambio il ${day}`,
		people: (n: number) => (n === 1 ? '1 persona' : `${n} persone`),
		wishes: (n: number) => (n === 1 ? '1 desiderio' : `${n} desideri`),
		nobodySees: 'Nessuno, nemmeno tu, vedrà gli abbinamenti.'
	},

	home: {
		title: 'Secret Santa',
		eyebrow: 'Natale 2026',
		headline: 'Lo scambio di regali, ',
		headlineEm: 'senza bigliettini.',
		intro:
			'Crea l’evento, aggiungi la famiglia e invia gli inviti via email. Ognuno scrive la sua lista dei desideri e scopre in segreto a chi fare il regalo.',
		steps: ['Crea l’evento', 'Liste dei desideri', 'Estrai e invia le buste'],
		stepOf: (n: number) => `Passo ${n} di 3`,
		formTitle: 'Il tuo evento',
		eventName: 'Nome dell’evento',
		eventNameDefault: 'Natale in famiglia',
		exchangeDate: 'Data scambio',
		budgetPlaceholder: 'es. 30 €',
		message: 'Messaggio per tutti',
		optional: '(facoltativo)',
		yourName: 'Il tuo nome',
		yourEmail: 'La tua email',
		language: 'Lingua degli inviti',
		plays: 'Partecipo anch’io',
		playsHint: 'Non vedrai gli abbinamenti degli altri',
		submit: 'Avanti: aggiungi partecipanti',
		submitting: 'Creo l’evento…',
		switchTo: 'Cambia lingua'
	},

	admin: {
		pageTitle: (name: string) => `Gestisci · ${name}`,
		stepOf: (n: number) => `Passo ${n} di 3`,
		back: 'Crea un altro evento',
		titleDrawn: 'Inviti partiti!',
		title: 'Chi partecipa?',
		created: 'Evento creato!',
		yourLink: 'Il tuo link di gestione',
		saveLink: (email: string) =>
			`Salva questo link: è l’unico modo per gestire l’evento. Te l’abbiamo mandato anche a ${email}.`,
		linkLabel: 'Link di gestione',
		copy: 'Copia',
		copied: 'Copiato!',
		participants: 'Partecipanti',
		openedCount: (n: number) => ` · ${n} hanno aperto la busta`,
		readyCount: (n: number) => ` · ${n} liste pronte`,
		organizer: '· organizzatore',
		managedBy: (name: string) => `Gestito da ${name} · mail separata`,
		status: {
			opened: 'Busta aperta',
			sent: 'Busta inviata',
			notSent: 'Non inviata',
			ready: 'Lista pronta',
			writing: 'Sta scrivendo la lista'
		},
		changePhoto: 'Cambia foto',
		addPhoto: 'Aggiungi foto',
		photoInputLabel: (has: boolean, name: string) =>
			`${has ? 'Cambia' : 'Aggiungi'} la foto di ${name}`,
		photo: 'Foto',
		photoOptional: 'facoltativa',
		photoError: 'Non riesco a leggere questa immagine: prova con un’altra foto.',
		resend: 'Rimanda',
		resendLabel: (name: string) => `Rimanda l’invito a ${name}`,
		remove: (name: string) => `Rimuovi ${name}`,
		empty: 'Ancora nessuno. Aggiungi la prima persona qui sotto.',
		name: 'Nome',
		namePlaceholder: 'es. Sara',
		inviteGoesTo: 'L’invito arriva a',
		ownEmail: 'Alla sua email',
		managerOption: (name: string) => `${name} (gestisce l’invito)`,
		email: 'Email',
		emailPlaceholder: 'anche la stessa di un altro partecipante',
		exclusions: 'Esclusioni',
		exclusionsHint: 'Coppie che non devono pescarsi a vicenda.',
		removeExclusion: (a: string, b: string) => `Rimuovi esclusione ${a} e ${b}`,
		firstPerson: 'Prima persona',
		secondPerson: 'Seconda persona',
		person: 'Persona…',
		done: 'Fatto!',
		doneText:
			'Ognuno ha ricevuto il suo link segreto. Se qualcuno non trova la mail, usa “Rimanda”.',
		sentReport: (sent: number, failed: string[]) =>
			`Inviate ${sent} email${failed.length ? `; non riuscite: ${failed.join(', ')}` : ''}.`,
		nobodyCanSee: 'Nessuno, nemmeno tu, può vedere gli abbinamenti.',
		step1: '1. Liste dei desideri',
		step1Hint: 'Ognuno riceve una mail per scrivere la sua lista.',
		readyMeterLabel: 'Liste pronte',
		readyOf: (ready: number, total: number) => `${ready} di ${total}`,
		readySuffix: ' liste pronte.',
		allDone: 'Tutti hanno finito!',
		willNotify: 'Ti mandiamo una mail quando tutti hanno finito.',
		inviteNew: (n: number) =>
			n === 1 ? 'Invita la persona nuova' : `Invita le ${n} persone nuove`,
		inviteAll: (n: number) =>
			n === 1 ? 'Invia 1 invito per la lista' : `Invia ${n} inviti per la lista`,
		step2: '2. Estrazione',
		drawButton: 'Estrai e invia le buste',
		needThree: 'Servono almeno 3 persone.',
		confirmMissing: (n: number) =>
			n === 1
				? '1 persona non ha ancora finito la lista. '
				: `${n} persone non hanno ancora finito la lista. `,
		confirmDraw: (n: number) =>
			`Estrarre e inviare ${n} buste? Dopo non potrai più modificare i partecipanti.`,
		video: {
			title: 'Video di benvenuto',
			hint: 'Parte a tutto schermo quando ognuno apre il suo invito, poi lascia spazio alla pagina. Va benissimo un video breve (10–30 secondi), anche con musica.',
			desktop: 'Per computer',
			desktopHint: 'Orizzontale',
			mobile: 'Per telefono',
			mobileHint: 'Verticale · facoltativo: senza, il telefono usa quello per computer',
			choose: 'Scegli un video',
			change: 'Cambia video',
			remove: 'Rimuovi',
			uploading: (pct: number) => `Caricamento… ${pct}%`,
			saving: 'Salvo…',
			limits: 'MP4, WebM o MOV · massimo 40 MB',
			tooBig: 'Il video è troppo grande: massimo 40 MB.',
			format: 'Formato non supportato: usa MP4, WebM o MOV.',
			unreadable: 'Non riesco a leggere questo video: prova con un altro file.',
			failed: 'Caricamento non riuscito. Riprova.',
			unavailable: 'Il caricamento dei video non è configurato.',
			preview: 'Anteprima del video'
		},
		music: {
			title: 'Musica di sottofondo',
			hint: 'Suona mentre ognuno guarda il suo invito (dopo il video, se c’è). Chi la apre può sempre spegnerla.',
			choose: 'Scegli una canzone',
			change: 'Cambia canzone',
			remove: 'Rimuovi',
			uploading: (pct: number) => `Caricamento… ${pct}%`,
			saving: 'Salvo…',
			limits: 'MP3, M4A, OGG o WAV · massimo 15 MB',
			tooBig: 'Il file è troppo grande: massimo 15 MB.',
			format: 'Formato non supportato: usa MP3, M4A, OGG o WAV.',
			failed: 'Caricamento non riuscito. Riprova.',
			unavailable: 'Il caricamento della musica non è configurato.',
			preview: 'Ascolta la musica'
		},
		spotify: {
			label: 'Oppure un brano di Spotify',
			placeholder: 'Incolla il link o il codice da «Condividi → Incorpora»',
			hint: 'Spotify non parte da solo: chi apre l’invito preme play. Senza account Spotify si sente un’anteprima di 30 secondi.',
			save: 'Collega',
			remove: 'Rimuovi'
		}
	},

	invite: {
		pageTitle: (event: string) => `Il tuo Secret Santa · ${event}`,
		viewingFor: (name: string) => `Stai vedendo l’invito di ${name}`,
		hello: (name: string) => `Ciao ${name}!`,
		readyTitle: 'La tua lista è pronta. Ora si aspetta la busta!',
		readyText: (organizer: string) =>
			`Quando tutti avranno finito, ${organizer} farà l’estrazione e ti arriverà una mail per scoprire a chi fare il regalo. Puoi ancora modificare la lista qui sotto.`,
		writeTitle: 'Che cosa vorresti trovare sotto l’albero?',
		writeText:
			'Scrivi qui sotto la tua lista dei desideri: la vedrà solo chi ti farà il regalo. Quando hai finito, premi “La mia lista è pronta”.',
		envelopeFor: (name: string) => `${name}, c’è una busta per te`,
		open: 'Apri la busta',
		youGiftTo: (name: string) => `Ciao ${name}, quest’anno fai il regalo a…`,
		reopen: 'Riapri la busta',
		wishesOf: (name: string) => `I desideri di ${name}`,
		noWishes: 'Non ha scritto desideri: vai di fantasia!',
		secret: (name: string) => `Shh… è un segreto: non dirlo a ${name}!`,
		ownTitle: 'La tua lista dei desideri',
		ownTitleManaged: (name: string) => `La lista di ${name}`,
		ownHint: 'La vede solo chi ti fa il regalo.',
		ownHintManaged: (name: string) =>
			`La vede solo chi fa il regalo a ${name}. La compili tu per conto suo.`,
		removeWish: (w: string) => `Rimuovi ${w}`,
		addWish: 'Aggiungi un desiderio',
		addWishPlaceholder: 'Aggiungi un desiderio…',
		ready: 'Lista pronta',
		notReady: 'Devo ancora aggiungere qualcosa',
		markReady: 'La mia lista è pronta',
		needOne: 'Aggiungi almeno un desiderio.',
		edit: 'Modifica',
		envelopeLetter: 'Quest’anno fai il regalo a…',
		playersTitle: 'Chi gioca quest’anno',
		playersReady: (ready: number, total: number) =>
			ready === total
				? 'Tutte le liste sono pronte!'
				: `${ready} di ${total} hanno finito la lista`,
		playersCount: (n: number) => (n === 1 ? '1 persona' : `${n} persone`),
		you: 'Tu',
		readyBadge: 'lista pronta',
		photoOf: (name: string) => `Foto di ${name}`,
		introLabel: 'Video di benvenuto',
		skipIntro: 'Salta',
		soundOn: 'Attiva audio',
		soundOff: 'Togli audio',
		replayIntro: 'Rivedi il video',
		musicOn: 'Metti la musica',
		musicOff: 'Spegni la musica',
		soundtrack: 'La colonna sonora'
	},

	email: {
		subjects: {
			wishlist: 'Scrivi la tua lista dei desideri',
			wishlistManaged: (name: string) => `Scrivi la lista dei desideri di ${name}`,
			draw: 'Il tuo Secret Santa',
			drawManaged: (name: string) => `Il Secret Santa di ${name}`,
			admin: (event: string) => `Gestisci “${event}”`,
			allReady: 'Tutte le liste sono pronte: puoi fare l’estrazione!'
		},
		managedNotice: (name: string, manager: string) =>
			`Questa mail è per ${name}. La ricevi tu, ${manager}, perché gestisci il suo invito.`,
		managedNoticeDraw: ' Il tuo abbinamento arriva in una mail a parte.',
		managedNoticeWishlist: ' Scrivi tu la sua lista dei desideri.',
		exchangeDate: 'Data scambio',
		budget: 'Budget',
		wishlist: {
			title: (name: string) => `${name}, che cosa vorresti`,
			titleEm: 'trovare sotto l’albero?',
			body: 'Prima dell’estrazione, scrivi la tua lista dei desideri: la vedrà solo chi ti farà il regalo. Quando hai finito, premi',
			bodyButton: '“La mia lista è pronta”',
			cta: 'Scrivi la lista dei desideri',
			footnote: 'Quando tutti avranno finito, riceverai una nuova mail con la busta da aprire.',
			text: (event: string) => `Scrivi la tua lista dei desideri per ${event}`
		},
		draw: {
			title: (name: string) => `${name}, è uscito il tuo`,
			titleEm: 'abbinamento!',
			body: 'Apri il link per scoprire a chi fare il regalo e leggere la sua lista dei desideri.',
			cta: 'Scopri chi hai pescato',
			footnote: 'Il link è personale: non inoltrarlo, altrimenti la sorpresa salta.',
			text: (name: string, event: string) => `${name}, è uscito il tuo abbinamento per ${event}!`
		},
		personalLink: 'Il link è personale: non inoltrarlo.',
		admin: {
			title: (name: string) => `Ciao ${name}, il tuo Secret Santa è pronto!`,
			body: 'Da questo link aggiungi i partecipanti, mandi gli inviti per la lista dei desideri e poi lanci l’estrazione di',
			body2: 'Conservalo: è l’unico modo per gestire l’evento.',
			cta: 'Gestisci l’evento',
			footnote: 'Tranquillo: da qui non potrai vedere chi ha pescato chi.',
			text: (name: string, event: string, link: string) =>
				`Ciao ${name}, il tuo Secret Santa "${event}" è pronto.\nGestiscilo da qui (conserva il link): ${link}`
		},
		allReady: {
			title: (name: string) => `Ciao ${name}, è il momento di`,
			titleEm: 'pescare!',
			body: (n: number) =>
				`Tutte le ${n} persone hanno scritto la loro lista dei desideri. Apri la pagina dell’evento e premi`,
			bodyButton: '“Estrai e invia le buste”',
			body2: 'ognuno riceverà la sua busta.',
			cta: 'Vai all’estrazione',
			footnote: 'Nessuno, nemmeno tu, vedrà gli abbinamenti.',
			text: (event: string, n: number, link: string) =>
				`Tutte le liste di "${event}" sono pronte (${n} persone).\nFai l'estrazione da qui: ${link}`
		}
	},

	errors: {
		required: (label: string) => `${label}: campo obbligatorio.`,
		tooLong: (label: string, max: number) => `${label}: massimo ${max} caratteri.`,
		invalidEmail: 'Email non valida.',
		eventNotFound: 'Evento non trovato.',
		alreadyDrawnLocked: 'L’estrazione è già stata fatta: non si può più modificare.',
		alreadyDrawn: 'L’estrazione è già stata fatta.',
		managerNotInEvent: 'Chi gestisce l’invito non fa parte dell’evento.',
		managerIsManaged: (name: string) => `${name} ha già l’invito gestito da qualcun altro.`,
		participantNotFound: 'Partecipante non trovato.',
		samePerson: 'Scegli due persone diverse.',
		invalidPeople: 'Persone non valide.',
		noParticipants: 'Aggiungi prima qualche partecipante.',
		inviteNotFound: 'Invito non trovato.',
		maxWishes: (n: number) => `Massimo ${n} desideri.`,
		photoTooBig: 'La foto è troppo grande (max 1,5 MB).',
		photoFormat: 'Formato non supportato: usa una foto JPG, PNG o WebP.',
		photoMissing: 'Scegli una foto.',
		missingParticipant: 'Partecipante mancante.',
		allInvited: 'Hanno già ricevuto tutti l’invito.',
		needThree: 'Servono almeno 3 partecipanti.',
		drawImpossible: 'Impossibile completare l’estrazione con queste esclusioni.',
		videoInvalid: 'Video non valido: ricaricalo.',
		videoMissing: 'Scegli un video.',
		videoTooBig: 'Il video è troppo grande: massimo 40 MB.',
		videoFormat: 'Formato non supportato: usa MP4, WebM o MOV.',
		videoPoster: 'Anteprima del video non valida.',
		musicInvalid: 'Musica non valida: ricaricala.',
		musicMissing: 'Scegli una canzone.',
		musicTooBig: 'Il file è troppo grande: massimo 15 MB.',
		musicFormat: 'Formato non supportato: usa MP3, M4A, OGG o WAV.',
		spotifyInvalid: 'Link di Spotify non valido: incolla il link di un brano, album o playlist.',
		labels: {
			yourName: 'Il tuo nome',
			eventName: 'Nome dell’evento',
			name: 'Nome',
			wish: 'Desiderio'
		}
	},

	notFound: {
		title: 'Ops, qui non c’è niente',
		invite: 'Questo invito non esiste. Controlla di aver copiato tutto il link dalla mail.',
		event: 'Questo evento non esiste. Controlla di aver copiato tutto il link.',
		generic: 'La pagina che cerchi non esiste.',
		home: 'Torna alla pagina iniziale'
	}
};

export type Messages = typeof it;
